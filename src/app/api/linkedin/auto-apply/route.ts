import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveResumeUrl } from '@/lib/resolve-resume';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Fetch User Profile
        const { data: userData, error: userError } = await supabaseAdmin
            .from('jobseekers')
            .select('*')
            .eq('uuid', userId)
            .single();

        if (userError || !userData) {
             return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // 2. Fetch Preferred Metadata (Domain and Location)
        const domainId = userData.domain_id;
        const locationId = userData.location_id;

        let preferredJobTitle = 'Software Engineer';
        if (domainId) {
            const { data: domain } = await supabaseAdmin.from('domains').select('name').eq('id', domainId).single();
            if (domain) preferredJobTitle = domain.name;
        }

        let preferredLocation = userData.current_city || 'Remote';
        if (locationId) {
            const { data: loc } = await supabaseAdmin.from('locations').select('name').eq('id', locationId).single();
            if (loc) preferredLocation = loc.name;
        }

        // 3. Prepare Paths
        const projectRoot = process.cwd();
        // Assuming AutoJobApply is next to the job portal folder
        const autoJobApplyPath = path.resolve(projectRoot, '../AutoJobApply');
        
        if (!fs.existsSync(autoJobApplyPath)) {
            return NextResponse.json({ error: 'AutoJobApply script directory not found.' }, { status: 500 });
        }

        const configsDir = path.join(autoJobApplyPath, 'configs');
        const resumesDir = path.join(autoJobApplyPath, 'resumes');
        
        if (!fs.existsSync(configsDir)) fs.mkdirSync(configsDir, { recursive: true });
        if (!fs.existsSync(resumesDir)) fs.mkdirSync(resumesDir, { recursive: true });

        const customConfigPath = path.join(configsDir, `${userId}_config.json`);
        const customResumePath = path.join(resumesDir, `${userId}_resume.pdf`);

        // 4. Download Resume if available (fallback to empty if not)
        let resumeSaved = false;
        if (userData.resume_url) {
            try {
                const resolvedUrl = await resolveResumeUrl(userData.resume_url);
                if (resolvedUrl) {
                    const res = await fetch(resolvedUrl);
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer());
                        fs.writeFileSync(customResumePath, buffer);
                        resumeSaved = true;
                    }
                }
            } catch (err) {
                console.error("Failed to download resume:", err);
            }
        }
        
        if (!resumeSaved) {
             fs.writeFileSync(customResumePath, "");
        }

        // 5. Carry over master API keys from original config
        const originalConfigPath = path.join(autoJobApplyPath, 'config.json');
        let masterApiKeys = {};
        if (fs.existsSync(originalConfigPath)) {
            try {
               const originalConfig = JSON.parse(fs.readFileSync(originalConfigPath, 'utf-8'));
               masterApiKeys = originalConfig.api_keys || {};
            } catch (e) {
                console.log("Could not read original config for API keys.");
            }
        }

        // 6. Build the custom Config
        const firstName = userData.name?.split(' ')[0] || 'Unknown';
        const lastName = userData.name?.split(' ').slice(1).join(' ') || '';

        const customConfig = {
            api_keys: masterApiKeys,
            personal_info: {
                first_name: firstName,
                last_name: lastName,
                phone: userData.phone || "",
                city: userData.current_city || "",
                email: userData.email || ""
            },
            preferences: {
                resume_path: customResumePath,
                job_titles: [preferredJobTitle],
                locations: [preferredLocation, "Remote"],
                workplace_type: "Remote"
            },
            qa: {
                years_of_experience: userData.experience_years?.toString() || "2",
                sponsorship_required: "No",
                legally_authorized: "Yes",
                clearance: "No",
                degree: "Bachelor's"
            }
        };

        fs.writeFileSync(customConfigPath, JSON.stringify(customConfig, null, 4));

        // 7. Spawn Python Process
        let pythonExecutable = 'python';
        const venvPythonPath = path.join(autoJobApplyPath, 'venv', 'Scripts', 'python.exe');
        if (fs.existsSync(venvPythonPath)) {
            pythonExecutable = venvPythonPath;
        }

        const botProcess = spawn(pythonExecutable, ['main.py', '--config', `configs/${userId}_config.json`], {
            cwd: autoJobApplyPath,
            detached: true,
            stdio: 'ignore'
        });
        
        botProcess.unref();

        return NextResponse.json({ 
            success: true, 
            message: 'Automation started successfully. A browser window will open shortly on the host machine.' 
        });

    } catch (error: any) {
        console.error('LinkedIn Auto Apply Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

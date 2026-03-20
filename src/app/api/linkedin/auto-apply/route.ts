import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // 1. Fetch User Data
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
             return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userData = userDoc.data() as any;

        // 2. Fetch User's details to make the bot smarter
        const domainDoc = userData.domainId ? await db.collection('domains').doc(userData.domainId).get() : null;
        const locationDoc = userData.locationId ? await db.collection('locations').doc(userData.locationId).get() : null;
        
        const preferredJobTitle = domainDoc?.exists ? domainDoc.data()?.name : 'Software Engineer';
        const preferredLocation = locationDoc?.exists ? locationDoc.data()?.name : userData.location || 'Remote';

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

        // 4. Download Resume if available (fallback to dummy if not)
        let resumeSaved = false;
        if (userData.resumeUrl) {
            try {
                const res = await fetch(userData.resumeUrl);
                if (res.ok) {
                    const buffer = Buffer.from(await res.arrayBuffer());
                    fs.writeFileSync(customResumePath, buffer);
                    resumeSaved = true;
                }
            } catch (err) {
                console.error("Failed to download resume:", err);
            }
        }
        
        if (!resumeSaved) {
             // Just creating an empty file to prevent errors if no resume
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
                city: userData.location || "",
                email: userData.email || ""
            },
            preferences: {
                resume_path: customResumePath,
                job_titles: [preferredJobTitle],
                locations: [preferredLocation, "Remote"],
                workplace_type: "Remote"
            },
            qa: {
                years_of_experience: "2",
                sponsorship_required: "No",
                legally_authorized: "Yes",
                clearance: "No",
                degree: userData.educationLevel || "Bachelor's"
            }
        };

        fs.writeFileSync(customConfigPath, JSON.stringify(customConfig, null, 4));

        // 7. Spawn Python Process
        // Run detatched so NextJS doesn't wait for it
        let pythonExecutable = 'python';
        const venvPythonPath = path.join(autoJobApplyPath, 'venv', 'Scripts', 'python.exe');
        if (fs.existsSync(venvPythonPath)) {
            pythonExecutable = venvPythonPath;
        }

        console.log(`Executing: ${pythonExecutable} main.py --config configs/${userId}_config.json`);
        const botProcess = spawn(pythonExecutable, ['main.py', '--config', `configs/${userId}_config.json`], {
            cwd: autoJobApplyPath,
            detached: true,
            stdio: 'ignore'
        });
        
        botProcess.unref(); // Allow the parent to exit independently

        return NextResponse.json({ 
            success: true, 
            message: 'Automation started successfully. A browser window will open shortly on the host machine.' 
        });

    } catch (error: any) {
        console.error('LinkedIn Auto Apply Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

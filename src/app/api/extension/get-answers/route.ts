import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const { userId, questions } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        if (!questions || questions.length === 0) {
            return NextResponse.json({ data: {} });
        }

        // 1. Fetch User Data from Supabase
        const { data: userData, error: userError } = await supabaseAdmin
            .from('jobseekers')
            .select('*')
            .eq('uuid', userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

        // 3. Build User Context 
        const userContext = {
            personal_info: {
                first_name: userData.name?.split(' ')[0] || '',
                last_name: userData.name?.split(' ').slice(1).join(' ') || '',
                phone: userData.phone || "",
                city: userData.current_city || "",
                email: userData.email || ""
            },
            preferences: {
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

        // 4. Extract Groq API Key
        let groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            try {
                const autoJobApplyPath = path.resolve(process.cwd(), '../AutoJobApply');
                const configPath = path.join(autoJobApplyPath, 'config.json');
                if (fs.existsSync(configPath)) {
                    const originalConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                    groqApiKey = originalConfig?.api_keys?.groq;
                }
            } catch (e) {
                console.warn("Could not read original config for API keys.");
            }
        }

        if (!groqApiKey) {
            return NextResponse.json({ error: 'Groq API Key not configured on the server.' }, { status: 500 });
        }

        // 5. Construct Prompt
        const prompt = `You are an intelligent job application assistant helping a user automatically fill out an online "Easy Apply" job application form.

Here is the user's parsed profile and configuration context:
\`\`\`json
${JSON.stringify(userContext, null, 2)}
\`\`\`

Here are the questions present on the current form page:
\`\`\`json
${JSON.stringify(questions, null, 2)}
\`\`\`

YOUR TASK:
For each question, determine the most accurate answer based ONLY on the user's profile context.
- If it is a "text" or "number" field, provide the string or numeric answer. If the answer is an integer like years of experience, return a number string like "3".
- If it is a "radio" or "dropdown" field, you MUST select explicitly ONE exact string value provided in the "options" list.
- If it is a "checkbox" field, you MUST select a list of explicit string values from the "options" list.
- If the user profile does not contain the exact answer, make the most logical, safest assumption (e.g. assume they are proficient in the language of the application, or assume '0' years if a specific niche skill is listed that they don't have).

Respond ONLY with a valid JSON object. No explanation, no markdown, no extra text. Just the raw JSON.`;

        // 6. Fetch Answers from Groq
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        const answers = JSON.parse(content);

        return NextResponse.json({ data: answers });

    } catch (error: any) {
        console.error('LinkedIn Extension Auto Apply Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

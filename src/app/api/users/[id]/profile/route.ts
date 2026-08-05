import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Section = 'education' | 'projects' | 'employment' | 'languages' | 'skills' | 'personal';
const sectionList: Section[] = ['education', 'projects', 'employment', 'languages', 'skills', 'personal'];

const isValidSection = (section: string | null): section is Section => {
    return !!section && sectionList.includes(section as Section);
}

// Map frontend section names to DB table names
const tableMap: Record<Section, string> = {
    education: 'education',
    projects: 'projects',
    employment: 'experience', // Note the difference
    languages: 'languages',
    skills: 'jobseeker_skills',
    personal: 'jobseeker_personal_details'
};

const mapDbToFrontend = (section: string, item: any) => {
    if (!item) return item;
    const mapped = { ...item };
    
    // Common date mappings
    if (item.start_date) {
        mapped.startDate = item.start_date;
        delete mapped.start_date;
    }
    if (item.end_date) {
        mapped.endDate = item.end_date;
        delete mapped.end_date;
    }
    if ('is_current' in item) {
        mapped.isCurrent = item.is_current;
        delete mapped.is_current;
    }

    // Section specific mappings
    if (section === 'education') {
        if (item.field_of_study) {
            mapped.fieldOfStudy = item.field_of_study;
            delete mapped.field_of_study;
        }
        if (item.employment_type) {
            mapped.employmentType = item.employment_type;
            delete mapped.employment_type;
        }
    } else if (section === 'personal') {
        if (item.marital_status) {
            mapped.maritalStatus = item.marital_status;
            delete mapped.marital_status;
        }
        if (item.date_of_birth) {
            mapped.dateOfBirth = item.date_of_birth;
            delete item.date_of_birth;
        }
        if (item.disability_status) {
            mapped.disabilityStatus = item.disability_status;
            delete item.disability_status;
        }
        if (item.military_experience) {
            mapped.militaryExperience = item.military_experience;
            delete item.military_experience;
        }
        if (item.career_break) {
            mapped.careerBreak = item.career_break;
            delete item.career_break;
        }
    }

    return mapped;
};

const mapFrontendToDb = (data: any) => {
    const mapping: Record<string, string> = {
        fieldOfStudy: 'field_of_study',
        startDate: 'start_date',
        endDate: 'end_date',
        isCurrent: 'is_current',
        employmentType: 'employment_type',
        proficiencyLevel: 'proficiency_level',
        yearsExperience: 'years_experience',
        maritalStatus: 'marital_status',
        dateOfBirth: 'date_of_birth',
        category: 'category',
        disabilityStatus: 'disability_status',
        militaryExperience: 'military_experience',
        careerBreak: 'career_break'
    };

    const mappedData: any = { ...data };
    for (const [frontendKey, dbKey] of Object.entries(mapping)) {
        if (frontendKey in mappedData) {
            let value = mappedData[frontendKey];
            
            // Normalize YYYY-MM to YYYY-MM-DD for PostgreSQL DATE type
            if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
                value = `${value}-01`;
            }
            
            mappedData[dbKey] = value;
            delete mappedData[frontendKey];
        }
    }
    return mappedData;
};

// GET handler
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id: userId } = params;
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');
        
        // Resolve user_pk for GET requests
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        const { data: user, error: userError } = await supabaseAdmin
            .from('jobseekers')
            .select('id, uuid')
            .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userPk = user.id;
        
        if (section) {
            if (!isValidSection(section)) {
                return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
            }

            if (section === 'skills') {
                const { data, error } = await supabaseAdmin
                    .from('jobseeker_skills')
                    .select('proficiency_level, years_experience, skills(*)')
                    .eq('user_pk', userPk);
                if (error) throw error;
                return NextResponse.json(data?.map((d: any) => ({
                    ...(d.skills as any),
                    proficiencyLevel: d.proficiency_level,
                    yearsExperience: d.years_experience
                })) || []);
            }

            if (section === 'personal') {
                const { data, error } = await supabaseAdmin
                    .from('jobseeker_personal_details')
                    .select('*')
                    .eq('user_pk', userPk)
                    .maybeSingle();
                if (error) throw error;
                return NextResponse.json(data ? mapDbToFrontend('personal', data) : null);
            }

            const { data, error } = await supabaseAdmin
                .from(tableMap[section])
                .select('*')
                .eq('user_pk', userPk);
            
            if (error) throw error;

            // Sorting
            if (section === 'languages') {
                (data as any[]).sort((a, b) => (a.language || '').localeCompare(b.language || ''));
            }

            const mappedData = (data as any[]).map(item => mapDbToFrontend(section, item));
            return NextResponse.json(mappedData);
        }
        
        // Fetch all sections
        const [edu, exp, proj, lang, skills, personal] = await Promise.all([
            supabaseAdmin.from('education').select('*').eq('user_pk', userPk),
            supabaseAdmin.from('experience').select('*').eq('user_pk', userPk),
            supabaseAdmin.from('projects').select('*').eq('user_pk', userPk),
            supabaseAdmin.from('languages').select('*').eq('user_pk', userPk),
            supabaseAdmin.from('jobseeker_skills').select('proficiency_level, years_experience, skills(*)').eq('user_pk', userPk),
            supabaseAdmin.from('jobseeker_personal_details').select('*').eq('user_pk', userPk).maybeSingle(),
        ]);

        return NextResponse.json({
            education: (edu.data || []).map((i: any) => mapDbToFrontend('education', i)),
            employment: (exp.data || []).map((i: any) => mapDbToFrontend('experience', i)),
            projects: (proj.data || []).map((i: any) => mapDbToFrontend('projects', i)),
            languages: lang.data || [],
            skills: skills.data?.map((d: any) => ({
                ...(d.skills as any),
                proficiencyLevel: d.proficiency_level,
                yearsExperience: d.years_experience
            })) || [],
            personal: personal.data ? mapDbToFrontend('personal', personal.data) : null
        });
    } catch (e: any) {
        console.error("Profile GET Error:", e);
        return NextResponse.json({ error: 'Failed to fetch profile data' }, { status: 500 });
    }
}

// POST handler
export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    try {
        const { id: userId } = params;
        const body = await request.json();

        if (!isValidSection(section)) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        // Resolve user_pk (numeric ID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        const { data: user, error: userError } = await supabaseAdmin
            .from('jobseekers')
            .select('id, uuid')
            .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userPk = user.id;

        if (section === 'skills') {
            const skillIdentifier = body.id || body.uuid;
            if (!skillIdentifier) return NextResponse.json({ error: 'Skill identifier required' }, { status: 400 });
            
            // Resolve skill_pk (handles both numeric id and uuid)
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(skillIdentifier));
            const { data: skillDb } = await supabaseAdmin
                .from('skills')
                .select('id, name')
                .eq(isUuid ? 'uuid' : 'id', isUuid ? skillIdentifier : parseInt(String(skillIdentifier), 10))
                .single();
                
            if (!skillDb) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

            const { data, error } = await supabaseAdmin
                .from('jobseeker_skills')
                .insert({ 
                    user_pk: userPk,
                    skill_pk: skillDb.id,
                    proficiency_level: (body.proficiencyLevel || 'beginner').toLowerCase(),
                    years_experience: body.yearsExperience || 0
                })
                .select('proficiency_level, years_experience, skills(*)')
                .single();
            if (error) throw error;
            return NextResponse.json({
                ...(data.skills as any),
                proficiencyLevel: data.proficiency_level,
                yearsExperience: data.years_experience
            }, { status: 201 });
        }

        const dataToInsert = mapFrontendToDb({ 
            user_pk: userPk,
            ...body
        });

        const { data, error } = await supabaseAdmin
            .from(tableMap[section])
            .insert(dataToInsert)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 201 });
    } catch (e: any) {
        console.error("Profile POST Error:", e);
        return NextResponse.json({ error: `Failed to create item in ${section || 'section'}` }, { status: 500 });
    }
}

// PUT handler
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    try {
        const { id: userId } = params;
        const body = await request.json();
        const { id, ...dataToUpdate } = body;

        if (!isValidSection(section)) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }
        
        if (!id) {
            return NextResponse.json({ error: 'Item ID is required for update' }, { status: 400 });
        }

        // Resolve user_pk (numeric ID)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        const { data: user, error: userError } = await supabaseAdmin
            .from('jobseekers')
            .select('id, uuid')
            .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userPk = user.id;

        if (section === 'skills') {
            const skillIdentifier = id || body.uuid;
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(skillIdentifier));
            const { data: skillDb } = await supabaseAdmin
                .from('skills')
                .select('id')
                .eq(isUuid ? 'uuid' : 'id', isUuid ? skillIdentifier : parseInt(String(skillIdentifier), 10))
                .single();

            if (!skillDb) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });

            const { data, error } = await supabaseAdmin
                .from('jobseeker_skills')
                .update({
                    proficiency_level: (body.proficiencyLevel || 'beginner').toLowerCase(),
                    years_experience: body.yearsExperience || 0
                })
                .eq('user_pk', userPk)
                .eq('skill_pk', skillDb.id)
                .select('proficiency_level, years_experience, skills(*)')
                .single();

            if (error) throw error;
            return NextResponse.json({
                ...(data.skills as any),
                proficiencyLevel: data.proficiency_level,
                yearsExperience: data.years_experience
            }, { status: 200 });
        }

        // Handle camelCase to snake_case
        const mappedDataToUpdate = mapFrontendToDb(dataToUpdate);

        const { data, error } = await supabaseAdmin
            .from(tableMap[section])
            .update(mappedDataToUpdate)
            .eq('id', id)
            .eq('user_pk', userPk)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        console.error("Profile PUT Error:", e);
        return NextResponse.json({ error: `Failed to update item in ${section || 'section'}` }, { status: 500 });
    }
}

// DELETE handler
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    try {
        const { id: userId } = params;
        const { id } = await request.json();

        if (!isValidSection(section)) {
            return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required for deletion' }, { status: 400 });
        }

        // Resolve user_pk
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
        const { data: user, error: userError } = await supabaseAdmin
            .from('jobseekers')
            .select('id, uuid')
            .eq(isUUID ? 'uuid' : 'id', isUUID ? userId : parseInt(userId, 10))
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const userPk = user.id;

        if (section === 'skills') {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id));
            const { data: skillDb } = await supabaseAdmin
                .from('skills')
                .select('id')
                .eq(isUuid ? 'uuid' : 'id', isUuid ? id : parseInt(String(id), 10))
                .single();
            
            if (!skillDb) return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
            const skillPk = skillDb.id;

            const { error } = await supabaseAdmin
                .from('jobseeker_skills')
                .delete()
                .eq('skill_pk', skillPk)
                .eq('user_pk', userPk);

            if (error) throw error;
        } else {
            const { error } = await supabaseAdmin
                .from(tableMap[section])
                .delete()
                .eq('id', id)
                .eq('user_pk', userPk);

            if (error) throw error;
        }

        return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } catch (e: any) {
        console.error("Profile DELETE Error:", e);
        return NextResponse.json({ error: `Failed to delete item from ${section || 'section'}` }, { status: 500 });
    }
}

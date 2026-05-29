import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { resolveResumeUrl } from '@/lib/resolve-resume';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 1. Check authorization - support both numeric pk and UUID
    const isNumericUserId = /^\d+$/.test(userId);
    let userProfile = null;

    const seekerQuery = supabaseAdmin
        .from('jobseekers')
        .select('plan_type, talent_search_expires_at');
    const { data: seeker } = await (isNumericUserId
        ? seekerQuery.eq('id', parseInt(userId))
        : seekerQuery.eq('uuid', userId)
    ).single();

    if (seeker) {
        userProfile = { ...seeker, role: 'Job Seeker' };
    } else {
        const recruiterQuery = supabaseAdmin
            .from('recruiters')
            .select('plan_type, talent_search_expires_at');
        const { data: recruiter } = await (isNumericUserId
            ? recruiterQuery.eq('id', parseInt(userId))
            : recruiterQuery.eq('uuid', userId)
        ).single();

        if (recruiter) {
            userProfile = { ...recruiter, role: 'Recruiter' };
        } else {
            const employeeQuery = supabaseAdmin
                .from('employees')
                .select('talent_search_expires_at');
            const { data: employee } = await (isNumericUserId
                ? employeeQuery.eq('id', parseInt(userId))
                : employeeQuery.eq('uuid', userId)
            ).single();

            if (employee) {
                userProfile = { ...employee, role: 'Employee', plan_type: 'none' };
            }
        }
    }

    if (!userProfile) {
        return NextResponse.json({ error: 'Unauthorized: Profile not found' }, { status: 403 });
    }

    const now = new Date();
    const hasPremium = userProfile.plan_type === 'premium' || userProfile.plan_type === 'pro';
    const hasTalentPlan = userProfile.talent_search_expires_at && new Date(userProfile.talent_search_expires_at) > now;

    if (!hasPremium && !hasTalentPlan && userProfile.role !== 'Admin') {
        return NextResponse.json({ 
            error: 'Access Denied: Talent Search requires a Premium or Talent Search plan.',
            requiresPlan: true 
        }, { status: 403 });
    }

    // 2. Build Search Query (resolve numeric IDs to UUIDs if needed)
    const search = searchParams.get('search') || '';
    let domainParam = searchParams.get('domain') || '';
    let skillParams = searchParams.getAll('skill').filter(Boolean);

    // Resolve domain numeric ID to UUID
    if (domainParam && /^\d+$/.test(domainParam)) {
        const { data: d } = await supabaseAdmin.from('domains').select('uuid').eq('id', domainParam).single();
        if (d) domainParam = d.uuid;
    }

    // Resolve skill numeric IDs to UUIDs
    const resolvedSkillUuids: string[] = [];
    if (skillParams.length > 0) {
        // Split numeric and UUID skills
        const numericSkillIds = skillParams.filter(s => /^\d+$/.test(s));
        const uuidSkillIds = skillParams.filter(s => !/^\d+$/.test(s));
        
        resolvedSkillUuids.push(...uuidSkillIds);
        
        if (numericSkillIds.length > 0) {
            const { data: skillsData } = await supabaseAdmin
                .from('skills')
                .select('uuid')
                .in('id', numericSkillIds);
            if (skillsData) {
                resolvedSkillUuids.push(...skillsData.map((s: any) => s.uuid));
            }
        }
    }

    let query = supabaseAdmin
        .from('jobseekers')
        .select('*, jobseeker_skills(skills(id, uuid, name))');

    if (domainParam) {
        query = query.eq('domain_id', domainParam);
    }

    if (search) {
        query = query.or(`name.ilike.%${search}%,headline.ilike.%${search}%,summary.ilike.%${search}%`);
    }
    
    const { data: users, error: searchError } = await query.limit(500);
    if (searchError) throw searchError;

    // Resolve all domain names in bulk
    const allDomainIds = Array.from(new Set((users || []).map((u: any) => u.domain_id).filter(Boolean)));
    let domainMap = new Map<string, string>();
    if (allDomainIds.length > 0) {
        const numericIds = allDomainIds.filter(id => /^\d+$/.test(String(id)));
        const uuidIds = allDomainIds.filter(id => !/^\d+$/.test(String(id)));

        const [ { data: domainsByPk }, { data: domainsByUuid } ] = await Promise.all([
            numericIds.length > 0 ? supabaseAdmin.from('domains').select('id, uuid, name').in('id', numericIds) : { data: [] },
            uuidIds.length > 0 ? supabaseAdmin.from('domains').select('id, uuid, name').in('uuid', uuidIds) : { data: [] }
        ]);

        const allDomains = [...(domainsByPk || []), ...(domainsByUuid || [])];
        allDomains.forEach(d => {
            domainMap.set(String(d.id), d.name);
            domainMap.set(String(d.uuid), d.name);
        });
    }

    let results = users || [];

    // Flatten jobseeker_skills into a skills array
    results = results.map((u: any) => {
        const flatSkills = u.jobseeker_skills 
            ? u.jobseeker_skills.map((jsk: any) => ({
                id: jsk.skills?.uuid || jsk.skills?.id,
                name: jsk.skills?.name || ''
              })).filter((s: any) => s.id)
            : [];
        return {
            ...u,
            mappedSkills: flatSkills.length > 0 ? flatSkills : []
        };
    });

    // Filter by skill IDs in-memory
    if (resolvedSkillUuids.length > 0) {
      results = results.filter((u: any) =>
        resolvedSkillUuids.some((id: string) => u.mappedSkills.some((s: any) => s.id === id))
      );
    }

    // Sort: more complete profiles first
    results.sort((a: any, b: any) => {
      const scoreA = (a.photoUrl ? 2 : 0) + (a.headline ? 1 : 0) + (a.mappedSkills.length > 0 ? 1 : 0);
      const scoreB = (b.photoUrl ? 2 : 0) + (b.headline ? 1 : 0) + (b.mappedSkills.length > 0 ? 1 : 0);
      return scoreB - scoreA;
    });

    // Sanitize and map to frontend structure
    const sanitized = await Promise.all(results.map(async (u: any) => ({
      id: u.uuid || u.id,
      name: u.name,
      headline: u.headline || '',
      photoUrl: u.metadata?.photoUrl || u.photoUrl || '',
      domainId: u.domain_id || '',
      domain: domainMap.get(String(u.domain_id)) || '',
      skills: u.mappedSkills,
      resumeUrl: await resolveResumeUrl(u.resume_url),
      location: u.current_city || '',
    })));

    return NextResponse.json(sanitized);
  } catch (e: any) {
    console.error('[API_TALENT_SEARCH] Error:', e);
    return NextResponse.json({ error: 'Failed to search talent', details: e.message }, { status: 500 });
  }
}

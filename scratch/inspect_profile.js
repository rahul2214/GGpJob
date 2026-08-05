const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vmghmqemuznipykgocxl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZ2htcWVtdXpuaXB5a2dvY3hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE0NjY3MiwiZXhwIjoyMDkwNzIyNjcyfQ.8wMaSK1XZ99-oGWYmrcDKPI7wX3q9pkMEQPa_D9ViFY';
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function inspectProfile() {
    const uid = 'ba7380d1-87b7-4055-a445-de97ab87e2e3'; // vadthyanaresh1008@gmail.com
    
    // Proactively check and reset credits if needed
    await supabaseAdmin.rpc('check_and_reset_credits_by_uuid', { p_uuid: uid });
    
    const { data: jobseeker, error: jobseekerError } = await supabaseAdmin
        .from('jobseekers')
        .select('*, roles(name), domains!domain_id(uuid, name), education(*), experience(*), projects(*), languages(*), jobseeker_personal_details(*), jobseeker_skills(proficiency_level, years_experience, skills(id, uuid, name))')
        .eq('uuid', uid)
        .maybeSingle();

    if (jobseekerError) {
        console.error('Error:', jobseekerError);
        return;
    }

    let resolvedSkills = [];
    if (jobseeker.jobseeker_skills && jobseeker.jobseeker_skills.length > 0) {
        resolvedSkills = jobseeker.jobseeker_skills.map((jsk) => ({
            id: jsk.skills?.uuid || jsk.skills?.id,
            uuid: jsk.skills?.uuid,
            name: jsk.skills?.name || '',
            proficiencyLevel: jsk.proficiency_level,
            yearsExperience: jsk.years_experience
        })).filter((s) => s.id);
    } else if (jobseeker.skills && Array.isArray(jobseeker.skills) && jobseeker.skills.length > 0) {
        resolvedSkills = jobseeker.skills;
    }

    const user = {
        id: jobseeker.id,
        uuid: jobseeker.uuid,
        name: jobseeker.name,
        email: jobseeker.email,
        phone: jobseeker.phone,
        role: jobseeker.roles?.name || jobseeker.role || 'Job Seeker',
        roleId: jobseeker.role_id,
        domainId: jobseeker.domains?.uuid || jobseeker.domain_id,
        resumeUrl: jobseeker.resume_url,
        skills: resolvedSkills,
        profileStats: {
            hasEducation: Array.isArray(jobseeker.education) && jobseeker.education.length > 0,
            hasEmployment: Array.isArray(jobseeker.experience) && jobseeker.experience.length > 0,
            hasSkills: (jobseeker.skill_ids && jobseeker.skill_ids.length > 0) || resolvedSkills.length > 0,
            hasProjects: Array.isArray(jobseeker.projects) && jobseeker.projects.length > 0,
            hasLanguages: Array.isArray(jobseeker.languages) && jobseeker.languages.length > 0,
            hasSummary: !!jobseeker.summary,
        },
    };

    console.log('Mapped User Profile:', user);
    
    // Test onboarding check
    const isOnboardingComplete = !!(
        user.domainId &&
        user.resumeUrl &&
        user.phone &&
        user.phone.length >= 10 &&
        user.profileStats?.hasSkills
    );
    console.log('isOnboardingComplete:', isOnboardingComplete);
}

inspectProfile();

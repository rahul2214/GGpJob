import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

/**
 * GET /auth/callback
 * Handles the OAuth PKCE flow: exchanges the 'code' for a session and manages profile creation.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const roleRequest = searchParams.get('role') || 'Job Seeker'; // Get role from query param
  const next = searchParams.get('next') ?? (roleRequest === 'Recruiter' ? '/company' : '/');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      const session = data?.session;
      
      // 1. Search across all tables to see if the profile already exists
      const tables = ['jobseekers', 'recruiters', 'employees', 'admins'];
      let foundProfile = null;

      for (const t of tables) {
        // Retrieve onboarding check fields for jobseekers
        const selectQuery = t === 'jobseekers'
          ? 'id, uuid, phone, resume_url, domain_id, jobseeker_skills(id)'
          : 'id, uuid';

        const { data: profile } = await supabaseAdmin
            .from(t)
            .select(selectQuery)
            .eq('uuid', user.id)
            .maybeSingle();
        
        if (profile) {
            foundProfile = { ...profile, table: t };
            break;
        }
      }

      if (!foundProfile) {
        // 2. Map role to target table and role ID
        let targetTable = 'jobseekers';
        let roleId = 1;

        if (roleRequest === 'Recruiter') {
            targetTable = 'recruiters';
            roleId = 2;
        } else if (roleRequest === 'Employee') {
            targetTable = 'employees';
            roleId = 3;
        }

        const metadata = user.user_metadata;
        const name = metadata?.full_name || metadata?.name || user.email?.split('@')[0] || 'New User';
        
        const profileData = {
          uuid: user.id,
          name: name,
          email: user.email!,
          role_id: roleId,
          phone: '',
          metadata: {
            auth_provider: 'google',
            photoUrl: metadata?.avatar_url || metadata?.picture || '',
          }
        };

        // Add role string and default plan for jobseekers legacy compatibility and default plan setting
        if (targetTable === 'jobseekers') {
            (profileData as any).role = 'Job Seeker';
            (profileData as any).plan_type = 'free';
            (profileData as any).is_paid = false;
            (profileData as any).credits = 2;
        }

        const { error: insertError } = await supabaseAdmin
          .from(targetTable)
          .insert(profileData);

        if (insertError) {
          console.error(`[AUTH_CALLBACK] Failed to create ${targetTable} profile:`, insertError);
        } else {
            console.log(`[AUTH_CALLBACK] Created new ${targetTable} profile for ${user.email}`);
        }
        
        // Redirect to onboarding for new users
        const onboardingPath = targetTable === 'recruiters' ? '/company/onboarding' : '/onboarding';
        if (session) {
          const sessionUrl = `${origin}/auth/session?access_token=${session.access_token}&refresh_token=${session.refresh_token}&next=${encodeURIComponent(onboardingPath)}`;
          return NextResponse.redirect(sessionUrl);
        }
        return NextResponse.redirect(`${origin}${onboardingPath}`);
      }

      // Check onboarding completeness for existing Job Seekers
      let redirectNext = next;
      if (foundProfile && foundProfile.table === 'jobseekers') {
        const phone = foundProfile.phone || '';
        const resumeUrl = foundProfile.resume_url || '';
        const domainId = foundProfile.domain_id || '';
        const hasSkills = Array.isArray(foundProfile.jobseeker_skills) && foundProfile.jobseeker_skills.length > 0;
        
        const isComplete = !!(phone && phone.length >= 10 && resumeUrl && domainId && hasSkills);
        if (!isComplete) {
          redirectNext = '/onboarding';
        }
      }

      // Existing user: redirect through session helper if session is available
      if (session) {
        const sessionUrl = `${origin}/auth/session?access_token=${session.access_token}&refresh_token=${session.refresh_token}&next=${encodeURIComponent(redirectNext)}`;
        return NextResponse.redirect(sessionUrl);
      }
    }
  }

  // Final redirect back to the app
  return NextResponse.redirect(`${origin}${next}`);
}

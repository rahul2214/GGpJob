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
      
      // 1. Search across all tables to see if the profile already exists (by uuid first, then by email)
      const tables = ['jobseekers', 'recruiters', 'admins'];
      let foundProfile: any = null;

      for (const t of tables) {
        // Retrieve onboarding check and credit fields for jobseekers
        const selectQuery = t === 'jobseekers'
          ? 'id, uuid, name, email, phone, resume_url, country, preferred_job_titles, subscription_credits, subscription_allowance, purchased_credits, referral_code, plan_type, is_paid, jobseeker_skills(id)'
          : 'id, uuid, name, email';

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

      // Fallback: Check by email if not found by uuid
      if (!foundProfile && user.email) {
        for (const t of tables) {
          const selectQuery = t === 'jobseekers'
            ? 'id, uuid, name, email, phone, resume_url, country, preferred_job_titles, subscription_credits, subscription_allowance, purchased_credits, referral_code, plan_type, is_paid, jobseeker_skills(id)'
            : 'id, uuid, name, email';

          const { data: profileByEmail } = await supabaseAdmin
              .from(t)
              .select(selectQuery)
              .eq('email', user.email)
              .maybeSingle();

          if (profileByEmail) {
              await supabaseAdmin.from(t).update({ uuid: user.id }).eq('id', profileByEmail.id);
              foundProfile = { ...profileByEmail, uuid: user.id, table: t };
              break;
          }
        }
      }

      const metadata = user.user_metadata;
      const name = metadata?.full_name || metadata?.name || user.email?.split('@')[0] || 'New User';

      if (!foundProfile) {
        // 2. Map role to target table and role ID
        let targetTable = 'jobseekers';
        let roleId = 1;

        if (roleRequest === 'Recruiter') {
            targetTable = 'recruiters';
            roleId = 2;
        }
        
        const profileData: any = {
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

        // Add 2 initial credits and 2 allowance for jobseekers
        if (targetTable === 'jobseekers') {
            profileData.subscription_credits = 2;
            profileData.subscription_allowance = 2;
            profileData.purchased_credits = 0;

            // Generate unique referral code for the new user
            let referralCodeGenerated = '';
            let attempts = 0;
            let isUnique = false;
            while (!isUnique && attempts < 5) {
              referralCodeGenerated = 'JD' + Math.random().toString(36).substring(2, 8).toUpperCase();
              const { data: existing } = await supabaseAdmin
                .from('jobseekers')
                .select('uuid')
                .eq('referral_code', referralCodeGenerated)
                .maybeSingle();
              if (!existing) {
                isUnique = true;
              }
              attempts++;
            }
            profileData.referral_code = referralCodeGenerated;
            profileData.referral_count = 0;
        }

        const { error: upsertError } = await supabaseAdmin
          .from(targetTable)
          .upsert(profileData, { onConflict: 'uuid' });

        if (upsertError) {
          console.error(`[AUTH_CALLBACK] Failed to upsert ${targetTable} profile:`, upsertError);
        } else {
          console.log(`[AUTH_CALLBACK] Created new ${targetTable} profile for ${user.email} with 2 credits & 2 allowance`);
        }
        
        // Redirect to onboarding for new users
        const onboardingPath = targetTable === 'recruiters' ? '/company/onboarding' : '/onboarding';
        if (session) {
          const sessionUrl = `${origin}/auth/session?access_token=${session.access_token}&refresh_token=${session.refresh_token}&next=${encodeURIComponent(onboardingPath)}`;
          return NextResponse.redirect(sessionUrl);
        }
        return NextResponse.redirect(`${origin}${onboardingPath}`);
      }

      // 3. For existing Job Seekers: ensure credits and allowance are at least 2 if uninitialized or 0 on free plan
      if (foundProfile && foundProfile.table === 'jobseekers') {
        const needsCreditsInit = (foundProfile.subscription_credits === null || foundProfile.subscription_credits === undefined || foundProfile.subscription_credits === 0) &&
                                 (foundProfile.subscription_allowance === null || foundProfile.subscription_allowance === undefined || foundProfile.subscription_allowance === 0);
        
        const updates: any = {};
        if (needsCreditsInit || foundProfile.subscription_credits === null || foundProfile.subscription_credits === undefined) {
          updates.subscription_credits = 2;
        }
        if (needsCreditsInit || foundProfile.subscription_allowance === null || foundProfile.subscription_allowance === undefined || foundProfile.subscription_allowance === 0) {
          updates.subscription_allowance = 2;
        }
        if (foundProfile.purchased_credits === null || foundProfile.purchased_credits === undefined) {
          updates.purchased_credits = 0;
        }
        if (!foundProfile.referral_code) {
          updates.referral_code = 'JD' + (user.id ? user.id.replace(/-/g, '').substring(0, 6).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase());
        }
        if (!foundProfile.name || foundProfile.name === 'New User') {
          updates.name = name;
        }

        if (Object.keys(updates).length > 0) {
          console.log(`[AUTH_CALLBACK] Updating credits & allowance for jobseeker ${user.email}:`, updates);
          await supabaseAdmin
            .from('jobseekers')
            .update(updates)
            .eq('id', foundProfile.id);
        }
      }

      // Check onboarding completeness for existing Job Seekers
      let redirectNext = next;
      if (foundProfile && foundProfile.table === 'jobseekers') {
        const phone = foundProfile.phone || '';
        const resumeUrl = foundProfile.resume_url || '';
        const country = foundProfile.country || '';
        const hasJobTitles = Array.isArray(foundProfile.preferred_job_titles) && foundProfile.preferred_job_titles.length > 0;
        const hasSkills = Array.isArray(foundProfile.jobseeker_skills) && foundProfile.jobseeker_skills.length > 0;
        
        const isComplete = !!(phone && phone.length >= 10 && resumeUrl && country && hasJobTitles && hasSkills);
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

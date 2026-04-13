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
      
      // 1. Search across all tables to see if the profile already exists
      const tables = ['jobseekers', 'recruiters', 'employees', 'admins'];
      let foundProfile = null;

      for (const t of tables) {
        const { data: profile } = await supabaseAdmin
            .from(t)
            .select('id, uuid')
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

        // Add role string for jobseekers legacy compatibility
        if (targetTable === 'jobseekers') {
            (profileData as any).role = 'Job Seeker';
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
        return NextResponse.redirect(`${origin}${onboardingPath}`);
      }
    }
  }

  // Final redirect back to the app
  return NextResponse.redirect(`${origin}${next}`);
}

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
  // if "next" is in param, use it as the redirect destination
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Initialize a temporary client to perform the code exchange
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const user = data.user;
      
      // 1. Check if user profile already exists in any table
      // We check API endpoint logic: Job Seeker is default for OAuth
      const { data: existingProfile } = await supabaseAdmin
        .from('jobseekers')
        .select('id')
        .eq('uuid', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // 2. Automated Profile Creation for First-Time OAuth Users
        const metadata = user.user_metadata;
        const name = metadata?.full_name || metadata?.name || user.email?.split('@')[0] || 'New User';
        
        const profileData = {
          uuid: user.id,
          name: name,
          email: user.email!,
          role_id: 1, // Job Seeker
          role: 'Job Seeker',
          phone: '',
          metadata: {
            auth_provider: 'google',
            photoUrl: metadata?.avatar_url || metadata?.picture || '',
          }
        };

        const { error: insertError } = await supabaseAdmin
          .from('jobseekers')
          .insert(profileData);

        if (insertError) {
          console.error('[AUTH_CALLBACK] Profile creation error:', insertError);
          // We continue anyway, as the auth session is valid
        } else {
            console.log(`[AUTH_CALLBACK] Created new profile for ${user.email}`);
        }
        
        // If it's a new user, force them to onboarding
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  // Final redirect back to the app
  return NextResponse.redirect(`${origin}${next}`);
}

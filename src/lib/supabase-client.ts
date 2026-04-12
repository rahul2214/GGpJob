import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase public credentials missing. Client-side database or auth operations may fail.');
}

/**
 * Standard Supabase client for client-side use.
 * Respects Row Level Security (RLS).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

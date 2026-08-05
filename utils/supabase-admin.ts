import { createClient } from '@supabase/supabase-js';

// We need an admin client to read push tokens across users and update notifications
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

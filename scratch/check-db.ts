
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from('applications')
    .select('id, proof_url, verification_status')
    .eq('verification_status', 'disputed')
    .limit(5);

  if (error) {
    console.error('Error fetching disputes:', error);
    return;
  }

  console.log('Recent disputed applications:');
  data.forEach(app => {
    console.log(`ID: ${app.id}, Proof URL: ${app.proof_url}`);
  });
}

test();

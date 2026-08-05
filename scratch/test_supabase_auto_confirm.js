const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseAutoConfirm() {
  const testEmail = `test_confirm_${Date.now()}@example.com`;
  console.log(`Creating user with email_confirm: false: ${testEmail}`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Password123!',
    email_confirm: false
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  const user = data.user;
  console.log('Created user auth details:');
  console.log('  ID:', user.id);
  console.log('  Email confirmed at:', user.email_confirmed_at);
  console.log('  Is email confirmed (email_confirmed_at exists):', !!user.email_confirmed_at);

  // Clean up
  console.log('Cleaning up user...');
  await supabase.auth.admin.deleteUser(user.id);
}

testSupabaseAutoConfirm().catch(console.error);

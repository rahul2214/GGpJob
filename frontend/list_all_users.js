const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listUsers() {
  const { data: users, error: err1 } = await supabase
    .from('users')
    .select('id, uuid, email, role');
    
  if (err1) {
    console.log('Error fetching users:', err1.message);
  } else {
    console.log('Public Users Table:', users);
  }
}

listUsers();

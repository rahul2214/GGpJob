const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testFixVisa500() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing PUT update for UUID ${uuid} with visa_requirement_id...`);

  // Payload without visa_requirement text column (only visa_requirement_id)
  const updateData = {
    visa_requirement_id: 1,
    updated_at: new Date().toISOString()
  };

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update(updateData)
    .eq('uuid', uuid)
    .select(`
      id, uuid, name, visa_requirement_id,
      visa_requirements:visa_requirement_id(id, name)
    `)
    .single();

  if (error) {
    console.error("❌ PUT Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved profile with visa_requirement_id:", updated);
  }
}

testFixVisa500();

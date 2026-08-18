const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testVisaRequirementColumn() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Checking visa_requirement column on jobseekers for UUID ${uuid}...`);

  const { data: user, error } = await supabase
    .from('jobseekers')
    .select('id, uuid, visa_requirement, metadata')
    .eq('uuid', uuid)
    .single();

  if (error) {
    console.error("❌ Select Error:", error);
  } else {
    console.log("🎉 SUCCESS! Column value:", {
      visa_requirement: user.visa_requirement,
      metadata_visaRequirement: user.metadata?.visaRequirement
    });
  }
}

testVisaRequirementColumn();

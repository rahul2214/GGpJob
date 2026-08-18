const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testUpdateVisaRequirement() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const newVisa = "Requires H1B Sponsorship";

  console.log(`Updating visa_requirement column for candidate ${uuid} to '${newVisa}'...`);

  // Fetch existing metadata to remove visaRequirement if present
  const { data: existing } = await supabase
    .from('jobseekers')
    .select('metadata')
    .eq('uuid', uuid)
    .single();

  const cleanMetadata = { ...(existing?.metadata || {}) };
  delete cleanMetadata.visaRequirement;

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      visa_requirement: newVisa,
      metadata: cleanMetadata,
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select('id, uuid, name, visa_requirement, metadata')
    .single();

  if (error) {
    console.error("❌ Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved directly in database column:");
    console.log("  • visa_requirement column:", updated.visa_requirement);
    console.log("  • metadata.visaRequirement exists?:", updated.metadata?.visaRequirement !== undefined);
  }
}

testUpdateVisaRequirement();

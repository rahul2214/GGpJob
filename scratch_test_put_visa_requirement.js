const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testPutVisaRequirement() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const incomingVisaRequirement = "No Visa Sponsorship Required";

  console.log(`Testing PUT simulation for candidate ${uuid} with visaRequirement = '${incomingVisaRequirement}'...`);

  // Fetch current user row
  const { data: user } = await supabase
    .from('jobseekers')
    .select('metadata')
    .eq('uuid', uuid)
    .single();

  const mergedMetadata = {
    ...(user?.metadata || {}),
  };

  // Strip keys that should NOT be in metadata
  delete mergedMetadata.country;
  delete mergedMetadata.state;
  delete mergedMetadata.currentCity;
  delete mergedMetadata.achievements;
  delete mergedMetadata.certifications;
  delete mergedMetadata.openToRelocate;
  delete mergedMetadata.openToRelocation;
  delete mergedMetadata.openWorldwide;
  delete mergedMetadata.visaRequirement;

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      visa_requirement: incomingVisaRequirement,
      metadata: mergedMetadata,
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select('id, uuid, name, visa_requirement, metadata')
    .single();

  if (error) {
    console.error("❌ PUT Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved in database column:");
    console.log("  • visa_requirement column:", updated.visa_requirement);
    console.log("  • metadata.visaRequirement exists?:", updated.metadata?.visaRequirement !== undefined);
    console.log("  • metadata JSONB keys:", Object.keys(updated.metadata || {}));
  }
}

testPutVisaRequirement();

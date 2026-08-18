const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testCleanMetadataRelocate() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing clean metadata and database column storage for openToRelocate / openWorldwide on UUID ${uuid}...`);

  // Fetch current metadata
  const { data: current } = await supabase.from('jobseekers').select('metadata').eq('uuid', uuid).single();
  const cleanedMeta = { ...(current?.metadata || {}) };
  delete cleanedMeta.openToRelocate;
  delete cleanedMeta.openToRelocation;
  delete cleanedMeta.openWorldwide;
  delete cleanedMeta.country;
  delete cleanedMeta.state;
  delete cleanedMeta.currentCity;
  delete cleanedMeta.achievements;
  delete cleanedMeta.certifications;

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      open_to_relocate: true,
      open_worldwide: false,
      metadata: cleanedMeta,
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select('id, uuid, name, open_to_relocate, open_worldwide, metadata')
    .single();

  if (error) {
    console.error("❌ Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved directly in database columns & metadata cleaned:");
    console.log("  • open_to_relocate column:", updated.open_to_relocate);
    console.log("  • open_worldwide column:", updated.open_worldwide);
    console.log("  • metadata JSONB (completely clean):", JSON.stringify(updated.metadata, null, 2));
  }
}

testCleanMetadataRelocate();

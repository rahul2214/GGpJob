const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testRelocateAndWorldwideColumns() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  console.log(`Testing open_to_relocate and open_worldwide column updates for UUID ${uuid}...`);

  // Update open_to_relocate = true and open_worldwide = true directly on database columns
  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      open_to_relocate: true,
      open_worldwide: true,
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select('id, uuid, name, open_to_relocate, open_worldwide, metadata')
    .single();

  if (error) {
    console.error("❌ Column Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved directly in database columns:");
    console.log("  • open_to_relocate column:", updated.open_to_relocate);
    console.log("  • open_worldwide column:", updated.open_worldwide);
    console.log("  • metadata (notice no openToRelocate / openWorldwide in metadata):", JSON.stringify(updated.metadata));
  }
}

testRelocateAndWorldwideColumns();

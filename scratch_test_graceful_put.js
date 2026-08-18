const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testGracefulPut() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const rest = {
    visaRequirement: "No Visa Sponsorship Required"
  };

  let vReqId = rest.visaRequirementId ? Number(rest.visaRequirementId) : null;
  const cleanVisaName = rest.visaRequirement ? rest.visaRequirement.trim() : '';

  if (!vReqId && cleanVisaName) {
    try {
      const { data: vObj } = await supabase
        .from('visa_requirements')
        .select('id')
        .ilike('name', cleanVisaName)
        .maybeSingle();
      if (vObj) vReqId = vObj.id;
    } catch (e) {
      // Table pending migration
    }
  }

  const updateData = {
    ...(cleanVisaName !== '' && { visa_requirement: cleanVisaName }),
    ...(vReqId !== null && { visa_requirement_id: vReqId }),
    updated_at: new Date().toISOString()
  };

  console.log("Update payload:", updateData);

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update(updateData)
    .eq('uuid', uuid)
    .select('id, uuid, name, visa_requirement')
    .single();

  if (error) {
    console.error("❌ Update error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved profile without breaking:", updated);
  }
}

testGracefulPut();

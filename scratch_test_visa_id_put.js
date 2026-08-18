const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testVisaIdPutSimulation() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  const rest = {
    visaRequirement: "Requires H1B Sponsorship"
  };

  console.log("Simulating PUT resolution for visa requirement:", rest);

  let vReqId = rest.visaRequirementId ? Number(rest.visaRequirementId) : null;
  const cleanVisaName = rest.visaRequirement ? rest.visaRequirement.trim() : '';

  if (!vReqId && cleanVisaName) {
    const { data: vObj } = await supabase
      .from('visa_requirements')
      .select('id')
      .ilike('name', cleanVisaName)
      .maybeSingle();
    if (vObj) vReqId = vObj.id;
  }

  console.log("Resolved Visa Requirement ID:", vReqId);

  // Perform database update
  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      ...(vReqId !== null ? { visa_requirement_id: vReqId } : {}),
      ...(cleanVisaName !== '' && { visa_requirement: cleanVisaName }),
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select(`
      id, uuid, name, visa_requirement, visa_requirement_id,
      visa_requirements:visa_requirement_id(id, name)
    `)
    .single();

  if (error) {
    console.error("❌ Update Error:", error);
  } else {
    console.log("🎉 SUCCESS! Updated Candidate Profile in Supabase:");
    console.log("  • Column visa_requirement:", updated.visa_requirement);
    console.log("  • Column visa_requirement_id:", updated.visa_requirement_id);
    console.log("  • Joined visa_requirements:", updated.visa_requirements);
  }
}

testVisaIdPutSimulation();

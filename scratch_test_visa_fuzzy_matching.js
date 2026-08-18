const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testVisaFuzzyMatching() {
  const testStrings = [
    "No sponsorship required",
    "Requires visa sponsorship",
    "Student visa / OPT",
    "Open to work permit",
    "No Visa Sponsorship Required",
    "Requires H1B Sponsorship"
  ];

  console.log("Testing Visa Requirement resolution logic:");

  for (const inputStr of testStrings) {
    let vReqId = null;
    const cleanVisaName = inputStr.trim();

    // 1. Check direct or ilike match
    const { data: vObj } = await supabase
      .from('visa_requirements')
      .select('id, name')
      .or(`name.ilike.${cleanVisaName},name.ilike.%${cleanVisaName}%`)
      .maybeSingle();

    if (vObj) {
      vReqId = vObj.id;
    } else {
      // Alias fallbacks for common user input strings
      const lower = cleanVisaName.toLowerCase();
      let fallbackQuery = '';
      if (lower.includes('no sponsorship') || lower.includes('citizen') || lower.includes('pr')) {
        fallbackQuery = 'No Visa Sponsorship Required';
      } else if (lower.includes('h1b')) {
        fallbackQuery = 'Requires H1B Sponsorship';
      } else if (lower.includes('green card')) {
        fallbackQuery = 'Requires Green Card / PR';
      } else if (lower.includes('student') || lower.includes('opt') || lower.includes('cpt')) {
        fallbackQuery = 'Student Visa (OPT / CPT)';
      } else if (lower.includes('permit') || lower.includes('visa sponsorship') || lower.includes('sponsorship')) {
        fallbackQuery = 'Need Work Permit / Visa Sponsorship';
      }

      if (fallbackQuery) {
        const { data: fbObj } = await supabase
          .from('visa_requirements')
          .select('id, name')
          .eq('name', fallbackQuery)
          .maybeSingle();
        if (fbObj) vReqId = fbObj.id;
      }
    }

    console.log(`  • Input: "${inputStr}" => Resolved ID: ${vReqId}`);
  }
}

testVisaFuzzyMatching();

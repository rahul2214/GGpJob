const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

function cleanJobseekerMetadata(rawMetadata) {
  if (!rawMetadata || typeof rawMetadata !== 'object') return {};
  const clean = { ...rawMetadata };
  
  const keysToRemove = [
    'country', 'state', 'currentCity', 'current_city', 'countryId', 'stateId', 'cityId',
    'achievements', 'certifications', 'openToRelocate', 'openToRelocation', 'openWorldwide',
    'visaRequirement', 'visaRequirementId', 'preferredJobTitles', 'preferred_job_titles',
    'preferredSalaryMin', 'preferred_salary_min', 'preferredSalaryMax', 'preferred_salary_max',
    'preferredCurrency', 'preferred_currency', 'remotePreference', 'remote_preference',
    'employmentTypes', 'employment_types', 'preferredIndustries', 'preferred_industries',
    'workAuthorization', 'work_authorization', 'preferredLanguages', 'preferred_languages',
    'preferredLocations', 'preferred_locations', 'gender', 'maritalStatus', 'dateOfBirth',
    'category', 'disabilityStatus', 'militaryExperience', 'careerBreak', 'headline', 'summary',
    'name', 'email', 'phone', 'skills', 'experience', 'education', 'projects', 'languages'
  ];

  for (const key of keysToRemove) {
    delete clean[key];
  }

  return clean;
}

async function testCleanMetadataInDb() {
  const uuid = "83c6486f-2d90-49c0-9b8e-0179d2623067";
  
  const rawMeta = {
    hasSeenReferralPrompt: true,
    referralStepDismissed: true,
    country: "India",
    preferredJobTitles: ["Developer"],
    employmentTypes: ["Full-time"],
    openToRelocate: true
  };

  const cleanedMeta = cleanJobseekerMetadata(rawMeta);
  console.log("Raw Metadata input:", rawMeta);
  console.log("Cleaned Metadata output:", cleanedMeta);

  const { data: updated, error } = await supabase
    .from('jobseekers')
    .update({
      metadata: cleanedMeta,
      updated_at: new Date().toISOString()
    })
    .eq('uuid', uuid)
    .select('id, uuid, name, metadata')
    .single();

  if (error) {
    console.error("❌ Update error:", error);
  } else {
    console.log("🎉 SUCCESS! Saved metadata in database:", updated.metadata);
  }
}

testCleanMetadataInDb();

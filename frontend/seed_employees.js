const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedEmployees() {
  console.log('Seeding employees...');

  // 1. Update existing employee Ram (ID: 27) to Rahul Naik
  const { data: updatedRam, error: updateRamErr } = await supabase
    .from('employees')
    .update({
      name: 'Rahul Naik',
      email: 'rahul.naik@google.com',
      company_name: 'Google',
      company_logo: 'https://logo.clearbit.com/google.com',
      company_website: 'https://google.com',
      designation: 'Senior Software Engineer',
      department: 'Search & AI',
      trust_score: 96,
      xp: 1200,
      level: 5,
      verified_referrals_count: 24,
      badge_ids: ['Connector'],
      role_id: 3,
      plan_type: 'none',
      is_paid: false
    })
    .eq('id', 27)
    .select();

  if (updateRamErr) {
    console.error('Error updating Ram:', updateRamErr.message);
  } else {
    console.log('Successfully updated Ram to Rahul Naik:', updatedRam);
  }

  // 2. Delete existing mock accounts if they exist (to keep the seed re-runnable)
  const mockUuids = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444'
  ];

  await supabase
    .from('employees')
    .delete()
    .in('uuid', mockUuids);

  // 3. Insert mock employees
  const mockEmployees = [
    {
      uuid: '11111111-1111-1111-1111-111111111111',
      name: 'Jane Doe',
      email: 'jane.doe@microsoft.com',
      company_name: 'Microsoft',
      company_logo: 'https://logo.clearbit.com/microsoft.com',
      company_website: 'https://microsoft.com',
      designation: 'Staff Product Manager',
      department: 'Product',
      trust_score: 85,
      xp: 600,
      level: 3,
      verified_referrals_count: 12,
      badge_ids: [],
      role_id: 3,
      plan_type: 'none',
      is_paid: false
    },
    {
      uuid: '22222222-2222-2222-2222-222222222222',
      name: 'Sarah Connor',
      email: 'sarah@meta.com',
      company_name: 'Meta',
      company_logo: 'https://logo.clearbit.com/meta.com',
      company_website: 'https://meta.com',
      designation: 'Talent Acquisition Lead',
      department: 'Recruiting',
      trust_score: 98,
      xp: 3200,
      level: 6,
      verified_referrals_count: 55,
      badge_ids: ['Connector'],
      role_id: 3,
      plan_type: 'none',
      is_paid: false
    },
    {
      uuid: '33333333-3333-3333-3333-333333333333',
      name: 'Arvind Kumar',
      email: 'arvind.k@netflix.com',
      company_name: 'Netflix',
      company_logo: 'https://logo.clearbit.com/netflix.com',
      company_website: 'https://netflix.com',
      designation: 'Senior Data Scientist',
      department: 'Algorithms',
      trust_score: 78,
      xp: 450,
      level: 2,
      verified_referrals_count: 5,
      badge_ids: [],
      role_id: 3,
      plan_type: 'none',
      is_paid: false
    },
    {
      uuid: '44444444-4444-4444-4444-444444444444',
      name: 'Bob Smith',
      email: 'bob.smith@mckinsey.com',
      company_name: 'McKinsey',
      company_logo: 'https://logo.clearbit.com/mckinsey.com',
      company_website: 'https://mckinsey.com',
      designation: 'Associate Consultant',
      department: 'Strategy',
      trust_score: 45,
      xp: 80,
      level: 1,
      verified_referrals_count: 0,
      badge_ids: [],
      role_id: 3,
      plan_type: 'none',
      is_paid: false
    }
  ];

  const { data: inserted, error: insertErr } = await supabase
    .from('employees')
    .insert(mockEmployees)
    .select();

  if (insertErr) {
    console.error('Error inserting mock employees:', insertErr.message);
  } else {
    console.log('Successfully inserted mock employees:', inserted.map(e => ({ id: e.id, name: e.name, company: e.company_name })));
  }
}

seedEmployees();

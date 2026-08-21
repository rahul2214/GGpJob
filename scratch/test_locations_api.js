const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testLocations() {
  console.log("Testing new GET /api/locations logic...");

  const { data: cities, error } = await supabaseAdmin
    .from('cities')
    .select(`
      id,
      name,
      states_provinces!state_province_id (
        id,
        name,
        countries!country_id (
          id,
          name
        )
      )
    `)
    .eq('is_active', true)
    .limit(10);

  if (error || !cities || cities.length === 0) {
    const { data: countries } = await supabaseAdmin
      .from('countries')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
      
    const formattedCountries = (countries || []).map((c) => ({
      id: c.id,
      uuid: String(c.id),
      name: c.name,
      country: c.name
    }));
    console.log("Fallback countries result count:", formattedCountries.length);
    return;
  }

  const formatted = cities.map((c) => ({
    id: c.id,
    uuid: String(c.id),
    name: `${c.name}${c.states_provinces?.name ? ', ' + c.states_provinces.name : ''}`,
    country: c.states_provinces?.countries?.name || 'India'
  }));

  console.log("SUCCESS! Formatted cities sample:", formatted.slice(0, 3));
}

testLocations().catch(console.error);

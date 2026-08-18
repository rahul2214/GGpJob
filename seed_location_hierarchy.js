const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(url, key);

const LOCATION_TREE = [
  {
    name: "India",
    code: "IN",
    phone_code: "+91",
    states: [
      {
        name: "Karnataka",
        code: "KA",
        cities: [
          { name: "Bengaluru", is_featured: true },
          { name: "Mysuru", is_featured: false },
          { name: "Hubballi-Dharwad", is_featured: false },
          { name: "Mangaluru", is_featured: false }
        ]
      },
      {
        name: "Telangana",
        code: "TS",
        cities: [
          { name: "Hyderabad", is_featured: true },
          { name: "Warangal", is_featured: false },
          { name: "Nizamabad", is_featured: false }
        ]
      },
      {
        name: "Maharashtra",
        code: "MH",
        cities: [
          { name: "Mumbai", is_featured: true },
          { name: "Pune", is_featured: true },
          { name: "Nagpur", is_featured: false },
          { name: "Thane", is_featured: false },
          { name: "Nashik", is_featured: false }
        ]
      },
      {
        name: "Delhi NCR",
        code: "DL",
        cities: [
          { name: "New Delhi", is_featured: true },
          { name: "Gurugram", is_featured: true },
          { name: "Noida", is_featured: true },
          { name: "Faridabad", is_featured: false },
          { name: "Ghaziabad", is_featured: false }
        ]
      },
      {
        name: "Tamil Nadu",
        code: "TN",
        cities: [
          { name: "Chennai", is_featured: true },
          { name: "Coimbatore", is_featured: false },
          { name: "Madurai", is_featured: false }
        ]
      },
      {
        name: "Gujarat",
        code: "GJ",
        cities: [
          { name: "Ahmedabad", is_featured: true },
          { name: "Surat", is_featured: false },
          { name: "Vadodara", is_featured: false }
        ]
      },
      {
        name: "West Bengal",
        code: "WB",
        cities: [
          { name: "Kolkata", is_featured: true },
          { name: "Siliguri", is_featured: false }
        ]
      },
      {
        name: "Rajasthan",
        code: "RJ",
        cities: [
          { name: "Jaipur", is_featured: true },
          { name: "Udaipur", is_featured: false }
        ]
      },
      {
        name: "Uttar Pradesh",
        code: "UP",
        cities: [
          { name: "Lucknow", is_featured: true },
          { name: "Kanpur", is_featured: false },
          { name: "Agra", is_featured: false }
        ]
      },
      {
        name: "Kerala",
        code: "KL",
        cities: [
          { name: "Kochi", is_featured: true },
          { name: "Thiruvananthapuram", is_featured: false }
        ]
      }
    ]
  },
  {
    name: "United States",
    code: "US",
    phone_code: "+1",
    states: [
      {
        name: "California",
        code: "CA",
        cities: [
          { name: "San Francisco", is_featured: true },
          { name: "Los Angeles", is_featured: true },
          { name: "Mountain View", is_featured: true },
          { name: "Cupertino", is_featured: true },
          { name: "San Jose", is_featured: true },
          { name: "Palo Alto", is_featured: true },
          { name: "Menlo Park", is_featured: true }
        ]
      },
      {
        name: "Washington",
        code: "WA",
        cities: [
          { name: "Seattle", is_featured: true },
          { name: "Redmond", is_featured: true },
          { name: "Bellevue", is_featured: false }
        ]
      },
      {
        name: "Texas",
        code: "TX",
        cities: [
          { name: "Austin", is_featured: true },
          { name: "Dallas", is_featured: false },
          { name: "Houston", is_featured: false }
        ]
      },
      {
        name: "New York",
        code: "NY",
        cities: [
          { name: "New York City", is_featured: true },
          { name: "Albany", is_featured: false }
        ]
      }
    ]
  },
  {
    name: "United Kingdom",
    code: "GB",
    phone_code: "+44",
    states: [
      {
        name: "England",
        code: "ENG",
        cities: [
          { name: "London", is_featured: true },
          { name: "Manchester", is_featured: true },
          { name: "Birmingham", is_featured: false },
          { name: "Cambridge", is_featured: true },
          { name: "Oxford", is_featured: false }
        ]
      },
      {
        name: "Scotland",
        code: "SCT",
        cities: [
          { name: "Edinburgh", is_featured: true },
          { name: "Glasgow", is_featured: false }
        ]
      }
    ]
  },
  {
    name: "Germany",
    code: "DE",
    phone_code: "+49",
    states: [
      {
        name: "Bavaria",
        code: "BY",
        cities: [
          { name: "Munich", is_featured: true },
          { name: "Nuremberg", is_featured: false }
        ]
      },
      {
        name: "Berlin",
        code: "BE",
        cities: [
          { name: "Berlin", is_featured: true }
        ]
      },
      {
        name: "Hesse",
        code: "HE",
        cities: [
          { name: "Frankfurt", is_featured: true }
        ]
      }
    ]
  },
  {
    name: "Singapore",
    code: "SG",
    phone_code: "+65",
    states: [
      {
        name: "Central Region",
        code: "SG-C",
        cities: [
          { name: "Singapore City", is_featured: true }
        ]
      }
    ]
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    phone_code: "+971",
    states: [
      {
        name: "Dubai",
        code: "DXB",
        cities: [
          { name: "Dubai", is_featured: true }
        ]
      },
      {
        name: "Abu Dhabi",
        code: "AUH",
        cities: [
          { name: "Abu Dhabi", is_featured: true }
        ]
      }
    ]
  },
  {
    name: "Canada",
    code: "CA",
    phone_code: "+1",
    states: [
      {
        name: "Ontario",
        code: "ON",
        cities: [
          { name: "Toronto", is_featured: true },
          { name: "Ottawa", is_featured: false }
        ]
      },
      {
        name: "British Columbia",
        code: "BC",
        cities: [
          { name: "Vancouver", is_featured: true }
        ]
      }
    ]
  }
];

async function seedLocationTree() {
  console.log("Seeding Location Hierarchy: Countries -> States/Provinces -> Cities...");

  for (const cData of LOCATION_TREE) {
    // 1. Insert/Select Country
    let { data: country } = await supabase
      .from('countries')
      .select('id, name')
      .eq('code', cData.code)
      .maybeSingle();

    if (!country) {
      const { data: newC, error: cErr } = await supabase
        .from('countries')
        .insert([{ name: cData.name, code: cData.code, phone_code: cData.phone_code, is_active: true }])
        .select('id, name')
        .single();

      if (cErr) {
        console.error(`Error inserting country ${cData.name}:`, cErr.message);
        continue;
      }
      country = newC;
    }

    console.log(`✓ Country: ${country.name} (ID: ${country.id})`);

    // 2. Insert States & Cities
    for (const sData of cData.states) {
      let { data: state } = await supabase
        .from('states_provinces')
        .select('id, name')
        .eq('country_id', country.id)
        .eq('name', sData.name)
        .maybeSingle();

      if (!state) {
        const { data: newS, error: sErr } = await supabase
          .from('states_provinces')
          .insert([{ country_id: country.id, name: sData.name, code: sData.code, is_active: true }])
          .select('id, name')
          .single();

        if (sErr) {
          console.error(`  Error inserting state ${sData.name}:`, sErr.message);
          continue;
        }
        state = newS;
      }

      console.log(`  └─ State: ${state.name} (ID: ${state.id})`);

      for (const cityObj of sData.cities) {
        let { data: city } = await supabase
          .from('cities')
          .select('id, name')
          .eq('state_province_id', state.id)
          .eq('name', cityObj.name)
          .maybeSingle();

        if (!city) {
          const { error: ciErr } = await supabase
            .from('cities')
            .insert([{ state_province_id: state.id, name: cityObj.name, is_featured: cityObj.is_featured, is_active: true }]);

          if (ciErr) {
            console.error(`      Error inserting city ${cityObj.name}:`, ciErr.message);
          } else {
            console.log(`      └─ City: ${cityObj.name} ${cityObj.is_featured ? '(Featured)' : ''}`);
          }
        }
      }
    }
  }

  console.log("\n🎉 SUCCESS! Seeding of Countries -> States -> Cities completed.");
}

seedLocationTree();

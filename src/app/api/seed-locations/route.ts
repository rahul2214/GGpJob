import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const indianCities = [
    { name: "Mumbai", country: "India" },
    { name: "Delhi", country: "India" },
    { name: "Bengaluru", country: "India" },
    { name: "Chennai", country: "India" },
    { name: "Hyderabad", country: "India" },
    { name: "Pune", country: "India" },
    { name: "Kolkata", country: "India" },
    { name: "Ahmedabad", country: "India" },
    { name: "Jaipur", country: "India" },
    { name: "Surat", country: "India" },
    { name: "Lucknow", country: "India" },
    { name: "Kanpur", country: "India" },
    { name: "Nagpur", country: "India" },
    { name: "Indore", country: "India" },
    { name: "Thane", country: "India" },
    { name: "Bhopal", country: "India" },
    { name: "Visakhapatnam", country: "India" },
    { name: "Noida", country: "India" },
    { name: "Gurugram", country: "India" }
];

export async function GET() {
  try {
    const { data: existingCities, error: fetchError } = await supabaseAdmin
        .from('locations')
        .select('name');
    
    if (fetchError) throw fetchError;

    const existingNames = new Set(existingCities?.map(c => c.name) || []);
    const citiesToAdd = indianCities.filter(city => !existingNames.has(city.name));

    if (citiesToAdd.length === 0) {
        return NextResponse.json({ message: 'Indian locations already exist in the database. No new locations were added.' }, { status: 200 });
    }

    const { error: insertError } = await supabaseAdmin
        .from('locations')
        .insert(citiesToAdd);

    if (insertError) throw insertError;

    return NextResponse.json({ 
        message: `${citiesToAdd.length} Indian locations have been successfully added to Supabase.` 
    }, { status: 200 });

  } catch (e: any) {
    console.error("[API_SEED_LOCATIONS] Error:", e);
    return NextResponse.json({ error: 'Failed to seed locations', details: e.message }, { status: 500 });
  }
}

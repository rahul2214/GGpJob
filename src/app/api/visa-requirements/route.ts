import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEFAULT_VISA_REQUIREMENTS = [
  { id: 1, name: "No Visa Sponsorship Required" },
  { id: 2, name: "Requires H1B Sponsorship" },
  { id: 3, name: "Requires Green Card / PR" },
  { id: 4, name: "Student Visa (OPT / CPT)" },
  { id: 5, name: "Need Work Permit / Visa Sponsorship" },
  { id: 6, name: "Authorized to Work Anywhere" }
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('visa_requirements')
      .select('id, name, description')
      .order('id', { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_VISA_REQUIREMENTS, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(DEFAULT_VISA_REQUIREMENTS, { status: 200 });
  }
}

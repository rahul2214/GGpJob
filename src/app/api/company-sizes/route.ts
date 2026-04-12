import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: sizes, error } = await supabaseAdmin
      .from('company_sizes')
      .select('*')
      .order('id'); // Order by ID or name
    
    if (error) throw error;
    return NextResponse.json(sizes);
  } catch (e: any) {
    console.error('Error fetching company sizes:', e);
    return NextResponse.json({ error: 'Failed to fetch company sizes', details: e.message }, { status: 500 });
  }
}

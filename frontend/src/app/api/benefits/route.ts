import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = supabaseAdmin;
    
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[API_BENEFITS_GET] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch benefits' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[API_BENEFITS_GET] Unexpected error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

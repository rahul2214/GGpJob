import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEFAULT_NOTICE_PERIODS = [
  { id: 1, name: "Immediate / Available Now", days: 0, display_order: 1 },
  { id: 2, name: "15 Days or less", days: 15, display_order: 2 },
  { id: 3, name: "1 Month", days: 30, display_order: 3 },
  { id: 4, name: "2 Months", days: 60, display_order: 4 },
  { id: 5, name: "3 Months", days: 90, display_order: 5 },
  { id: 6, name: "More than 3 Months", days: 120, display_order: 6 },
  { id: 7, name: "Serving Notice Period", days: 0, display_order: 7 }
];

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('notice_periods')
      .select('id, uuid, name, days, display_order')
      .order('display_order', { ascending: true, nullsFirst: false });

    if (error || !data || data.length === 0) {
      return NextResponse.json(DEFAULT_NOTICE_PERIODS, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(DEFAULT_NOTICE_PERIODS, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, days, display_order } = body;
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('notice_periods')
      .insert([{ name, days: days ?? null, display_order: display_order ?? 99 }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error('Failed to create notice period:', e);
    return NextResponse.json({ error: 'Failed to create notice period', details: e.message }, { status: 500 });
  }
}

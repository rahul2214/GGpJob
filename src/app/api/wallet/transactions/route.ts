import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('payouts')
      .select('*')
      .eq('employee_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (e: any) {
    console.error('[WALLET_TX_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch transactions', details: e.message }, { status: 500 });
  }
}

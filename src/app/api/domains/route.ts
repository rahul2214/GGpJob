import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: domains, error } = await supabaseAdmin
      .from('domains')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return NextResponse.json(domains);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Domain name is required' }, { status: 400 });
    }
    
    const { data: domain, error } = await supabaseAdmin
      .from('domains')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(domain, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create domain', details: e.message }, { status: 500 });
  }
}

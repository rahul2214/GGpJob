import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: workplaceTypes, error } = await supabaseAdmin
      .from('workplace_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return NextResponse.json(workplaceTypes);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch workplace types', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: workplaceType, error } = await supabaseAdmin
      .from('workplace_types')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(workplaceType, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create workplace type', details: e.message }, { status: 500 });
  }
}

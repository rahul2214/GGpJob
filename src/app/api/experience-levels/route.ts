import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: levels, error } = await supabaseAdmin
        .from('experience_levels')
        .select('*')
        .order('id', { ascending: true });
    
    if (error) throw error;
    return NextResponse.json(levels);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch experience levels', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Get max numeric ID
    const { data: maxLevel, error: maxError } = await supabaseAdmin
        .from('experience_levels')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();
    
    let newNumericId = 1;
    if (maxLevel) {
        newNumericId = maxLevel.id + 1;
    }
    
    const { data: newLevel, error: insertError } = await supabaseAdmin
        .from('experience_levels')
        .insert([{ id: newNumericId, name }])
        .select()
        .single();
    
    if (insertError) throw insertError;
    
    return NextResponse.json(newLevel, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create experience level', details: e.message }, { status: 500 });
  }
}

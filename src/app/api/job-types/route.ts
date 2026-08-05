import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data: jobTypes, error } = await supabaseAdmin
      .from('job_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return NextResponse.json(jobTypes);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch job types', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: jobType, error } = await supabaseAdmin
      .from('job_types')
      .insert([{ name }])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json(jobType, { status: 201 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create job type', details: e.message }, { status: 500 });
  }
}

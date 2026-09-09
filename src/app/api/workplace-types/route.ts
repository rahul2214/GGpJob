import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

let cachedWorkplaceTypes: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const DEFAULT_WORKPLACE_TYPES = [
  { id: 1, name: "On-site" },
  { id: 2, name: "Hybrid" },
  { id: 3, name: "Remote" }
];

export async function GET() {
  try {
    if (cachedWorkplaceTypes && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedWorkplaceTypes, { status: 200 });
    }
    const { data: workplaceTypes, error } = await supabaseAdmin
      .from('workplace_types')
      .select('*')
      .order('name');
    
    if (error) throw error;
    if (workplaceTypes && workplaceTypes.length > 0) {
      cachedWorkplaceTypes = workplaceTypes;
      cacheTime = Date.now();
      return NextResponse.json(workplaceTypes, { status: 200 });
    }
    return NextResponse.json(cachedWorkplaceTypes || DEFAULT_WORKPLACE_TYPES, { status: 200 });
  } catch (e: any) {
    console.warn('Error fetching workplace types, using cached/fallback:', e?.message || e);
    return NextResponse.json(cachedWorkplaceTypes || DEFAULT_WORKPLACE_TYPES, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

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

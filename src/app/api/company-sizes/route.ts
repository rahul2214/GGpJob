export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

let cachedCompanySizes: any[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const DEFAULT_COMPANY_SIZES = [
  { id: 1, name: "1-10 employees" },
  { id: 2, name: "11-50 employees" },
  { id: 3, name: "51-200 employees" },
  { id: 4, name: "201-500 employees" },
  { id: 5, name: "501-1000 employees" },
  { id: 6, name: "1001-5000 employees" },
  { id: 7, name: "5000+ employees" },
];

export async function GET() {
  try {
    if (cachedCompanySizes && Date.now() - cacheTime < CACHE_TTL) {
      return NextResponse.json(cachedCompanySizes, { status: 200 });
    }
    const { data: sizes, error } = await supabaseAdmin
      .from('company_sizes')
      .select('*')
      .order('id');
    
    if (error) throw error;
    if (sizes && sizes.length > 0) {
      cachedCompanySizes = sizes;
      cacheTime = Date.now();
      return NextResponse.json(sizes, { status: 200 });
    }
    return NextResponse.json(cachedCompanySizes || DEFAULT_COMPANY_SIZES, { status: 200 });
  } catch (e: any) {
    console.warn('Error fetching company sizes, serving fallback/cached:', e?.message || e);
    return NextResponse.json(cachedCompanySizes || DEFAULT_COMPANY_SIZES, { status: 200 });
  }
}



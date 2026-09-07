import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: Request) {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const tables = ['education', 'experience', 'projects', 'languages', 'jobseeker_skills', 'skills'];
    const results: any = {};

    for (const table of tables) {
        const { data, error } = await supabaseAdmin
            .from(table)
            .select('*')
            .limit(1);
        
        results[table] = {
            exists: !error || error.code !== 'PGRST116',
            error: error ? error.message : null,
            columnCount: data && data.length > 0 ? Object.keys(data[0]).length : 'unknown (no data)'
        };
    }

    return NextResponse.json(results);
}

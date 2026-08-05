import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
    const results: any = {};
    const tables = ['education', 'experience', 'projects', 'languages', 'jobseeker_skills'];
    
    for (const table of tables) {
        const { error } = await supabaseAdmin.from(table).select('count', { count: 'exact', head: true });
        results[table] = { exists: !error || error.code !== 'PGRST116', error: error ? { message: error.message, code: error.code } : null };
    }
    
    return NextResponse.json(results);
}

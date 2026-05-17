import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdmin } from '@/lib/check-admin';

export const dynamic = 'force-dynamic';

async function getCount(table: string, from?: string | null, to?: string | null, dateField: string = 'created_at') {
    let query = supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
    
    if (from) query = query.gte(dateField, from);
    if (to) query = query.lte(dateField, to);
    
    const { count, error } = await query;
    if (error) {
        console.error(`Error counting ${table}:`, error);
        throw error;
    }
    return count || 0;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const userId = searchParams.get('userId');

        // Security: If userId is provided, verify it. 
        // Note: For now, we skip if userId is missing to remain compatible with old frontend, 
        // but we recommend the frontend always sends it.
        if (userId) {
            const isAdmin = await checkAdmin(userId);
            if (!isAdmin) {
                return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
            }
        }

        // 1. Fetch Summary Counts (All-time totals for headline metrics)
        const [
            totalJobSeekers,
            totalRecruiters,
            totalEmployees,
            totalApplications,
            totalReferralJobs,
            totalDirectJobsResult,
            // Period counts
            periodJobSeekers,
            periodRecruiters,
            periodEmployees,
            periodApplications
        ] = await Promise.all([
            getCount('jobseekers', null, null, 'created_at'),
            getCount('recruiters', null, null, 'created_at'),
            getCount('employees', null, null, 'created_at'),
            getCount('applications', null, null, 'applied_at'),
            // Referral Jobs (All-time)
            (async () => {
                const { count } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('is_referral', true);
                return count || 0;
            })(),
            // Direct Jobs (All-time)
            (async () => {
                const { count } = await supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('is_referral', false);
                return count || 0;
            })(),
            // Period counts
            getCount('jobseekers', from, to, 'created_at'),
            getCount('recruiters', from, to, 'created_at'),
            getCount('employees', from, to, 'created_at'),
            getCount('applications', from, to, 'applied_at')
        ]);

        // 2. Fetch Grouped Data for Charts (All-time distribution for robust analytics view)
        
        // Jobs Grouping
        const { data: jobsByDomainRaw, error: jobsErr } = await supabaseAdmin
            .from('jobs')
            .select('is_referral, domains!domain_pk(name)');
        if (jobsErr) console.error('[API_ANALYTICS] Jobs query error:', jobsErr);

        const directJobsByDomainMap: Record<string, number> = {};
        const referralJobsByDomainMap: Record<string, number> = {};
        jobsByDomainRaw?.forEach((j: any) => {
            const name = j.domains?.name || 'Other';
            if (j.is_referral) referralJobsByDomainMap[name] = (referralJobsByDomainMap[name] || 0) + 1;
            else directJobsByDomainMap[name] = (directJobsByDomainMap[name] || 0) + 1;
        });

        // Users Grouping (Job Seekers)
        const { data: usersByDomainRaw } = await supabaseAdmin
            .from('jobseekers')
            .select('domains!domain_id(name)');

        const usersByDomainMap: Record<string, number> = {};
        usersByDomainRaw?.forEach((u: any) => {
            const name = u.domains?.name || 'Other';
            usersByDomainMap[name] = (usersByDomainMap[name] || 0) + 1;
        });

        if (usersByDomainRaw === null) console.warn('[API_ANALYTICS] Jobseekers query returned null. Check RLS or schema.');

        // Applications Grouping
        const { data: appsByDomainRaw, error: appsErr } = await supabaseAdmin
            .from('applications')
            .select('jobs!job_pk(domains!domain_pk(name))');
        if (appsErr) console.error('[API_ANALYTICS] Applications query error:', appsErr);

        const appsByDomainMap: Record<string, number> = {};
        appsByDomainRaw?.forEach((a: any) => {
            const name = (a.jobs as any)?.domains?.name || 'Other';
            appsByDomainMap[name] = (appsByDomainMap[name] || 0) + 1;
        });

        // Status Grouping
        const { data: appsByStatusRaw } = await supabaseAdmin
            .from('applications')
            .select('status_id');

        // Fallback Status Map
        const statusMap: Record<number, string> = {
            1: 'Applied',
            2: 'Profile Viewed',
            3: 'Not Suitable',
            4: 'Selected',
            5: 'Accepted',
            6: 'Referred',
            7: 'Interviewing',
            8: 'Offer Received',
            9: 'Hired'
        };

        const appsByStatusMap: Record<string, number> = {};
        appsByStatusRaw?.forEach((a: any) => {
            const name = statusMap[a.status_id] || 'Other';
            appsByStatusMap[name] = (appsByStatusMap[name] || 0) + 1;
        });

        const formatMap = (map: Record<string, number>) => 
            Object.entries(map).map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

        return NextResponse.json({
            totalJobSeekers,
            totalRecruiters,
            totalEmployees,
            totalDirectJobs: totalDirectJobsResult,
            totalReferralJobs,
            totalApplications,
            periodJobSeekers,
            periodRecruiters,
            periodEmployees,
            periodApplications,
            directJobsByDomain: formatMap(directJobsByDomainMap),
            referralJobsByDomain: formatMap(referralJobsByDomainMap),
            usersByDomain: formatMap(usersByDomainMap),
            applicationsByDomain: formatMap(appsByDomainMap),
            applicationsByStatus: formatMap(appsByStatusMap)
        });

    } catch (e: any) {
        console.error('[API_ANALYTICS_GET] Error:', e);
        return NextResponse.json({ 
            error: 'Failed to fetch analytics', 
            details: e.message 
        }, { status: 500 });
    }
}

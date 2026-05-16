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

        // 1. Fetch Summary Counts
        // Note: Schema uses 'created_at' for profiles/jobs and 'applied_at' for applications.
        const [
            totalJobSeekers,
            totalRecruiters,
            totalEmployees,
            totalApplications,
            totalReferralJobs,
            totalDirectJobsResult
        ] = await Promise.all([
            getCount('jobseekers', from, to, 'created_at'),
            getCount('recruiters', from, to, 'created_at'),
            getCount('employees', from, to, 'created_at'),
            getCount('applications', from, to, 'applied_at'),
            // Referral Jobs
            (async () => {
                let q = supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('is_referral', true);
                if (from) q = q.gte('created_at', from);
                if (to) q = q.lte('created_at', to);
                const { count } = await q;
                return count || 0;
            })(),
            // Direct Jobs
            (async () => {
                let q = supabaseAdmin.from('jobs').select('*', { count: 'exact', head: true }).eq('is_referral', false);
                if (from) q = q.gte('created_at', from);
                if (to) q = q.lte('created_at', to);
                const { count } = await q;
                return count || 0;
            })()
        ]);

        // 2. Fetch Grouped Data for Charts
        
        // Jobs Grouping
        let jobsQuery = supabaseAdmin
            .from('jobs')
            .select('is_referral, domains!domain_pk(name)'); // Corrected to domain_pk
        if (from) jobsQuery = jobsQuery.gte('created_at', from);
        if (to) jobsQuery = jobsQuery.lte('created_at', to);
        const { data: jobsByDomainRaw, error: jobsErr } = await jobsQuery;
        if (jobsErr) console.error('[API_ANALYTICS] Jobs query error:', jobsErr);

        const directJobsByDomainMap: Record<string, number> = {};
        const referralJobsByDomainMap: Record<string, number> = {};
        jobsByDomainRaw?.forEach((j: any) => {
            const name = j.domains?.name || 'Other';
            if (j.is_referral) referralJobsByDomainMap[name] = (referralJobsByDomainMap[name] || 0) + 1;
            else directJobsByDomainMap[name] = (directJobsByDomainMap[name] || 0) + 1;
        });

        // Users Grouping (Job Seekers)
        let usersQuery = supabaseAdmin
            .from('jobseekers')
            .select('domains!domain_id(name)');
        if (from) usersQuery = usersQuery.gte('created_at', from);
        if (to) usersQuery = usersQuery.lte('created_at', to);
        const { data: usersByDomainRaw } = await usersQuery;

        const usersByDomainMap: Record<string, number> = {};
        usersByDomainRaw?.forEach((u: any) => {
            const name = u.domains?.name || 'Other';
            usersByDomainMap[name] = (usersByDomainMap[name] || 0) + 1;
        });

        if (usersByDomainRaw === null) console.warn('[API_ANALYTICS] Jobseekers query returned null. Check RLS or schema.');

        // Applications Grouping
        let appsByDomainQuery = supabaseAdmin
            .from('applications')
            .select('jobs!job_pk(domains!domain_pk(name))'); // Corrected to job_pk and domain_pk
        if (from) appsByDomainQuery = appsByDomainQuery.gte('applied_at', from);
        if (to) appsByDomainQuery = appsByDomainQuery.lte('applied_at', to);
        const { data: appsByDomainRaw, error: appsErr } = await appsByDomainQuery;
        if (appsErr) console.error('[API_ANALYTICS] Applications query error:', appsErr);

        const appsByDomainMap: Record<string, number> = {};
        appsByDomainRaw?.forEach((a: any) => {
            const name = (a.jobs as any)?.domains?.name || 'Other';
            appsByDomainMap[name] = (appsByDomainMap[name] || 0) + 1;
        });

        // Status Grouping
        let appsByStatusQuery = supabaseAdmin
            .from('applications')
            .select('status_id'); // Select numeric status_id
        if (from) appsByStatusQuery = appsByStatusQuery.gte('applied_at', from);
        if (to) appsByStatusQuery = appsByStatusQuery.lte('applied_at', to);
        const { data: appsByStatusRaw } = await appsByStatusQuery;

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

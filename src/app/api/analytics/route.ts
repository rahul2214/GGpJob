import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

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
        const { user: adminUser, errorResponse } = await requireAdmin(request);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        // 1. Fetch Summary Counts
        const [
            totalJobSeekers,
            totalRecruiters,
            totalApplications,
            periodJobSeekers,
            periodRecruiters,
            periodApplications
        ] = await Promise.all([
            getCount('jobseekers', null, null, 'created_at'),
            getCount('recruiters', null, null, 'created_at'),
            getCount('applications', null, null, 'applied_at'),
            getCount('jobseekers', from, to, 'created_at'),
            getCount('recruiters', from, to, 'created_at'),
            getCount('applications', from, to, 'applied_at')
        ]);

        // Jobs count
        let totalReferralJobs = 0;
        let totalDirectJobsResult = 0;

        const { count: totalJobs } = await supabaseAdmin
            .from('jobs')
            .select('*', { count: 'exact', head: true });
        totalDirectJobsResult = totalJobs || 0;

        // 2. Fetch Grouped Data for Charts
        const { data: rawJobs } = await supabaseAdmin
            .from('jobs')
            .select('job_types:job_type_pk(name)');

        const jobsByIndustryRaw = rawJobs || [];

        const directJobsByIndustryMap: Record<string, number> = {};
        const referralJobsByIndustryMap: Record<string, number> = {};
        jobsByIndustryRaw?.forEach((j: any) => {
            const name = (j.job_types as any)?.name || 'General Tech';
            directJobsByIndustryMap[name] = (directJobsByIndustryMap[name] || 0) + 1;
        });

        // Users Grouping by Country
        const { data: usersByCountryRaw } = await supabaseAdmin
            .from('jobseekers')
            .select('countries:current_country_id(name)');

        const usersByCountryMap: Record<string, number> = {};
        usersByCountryRaw?.forEach((u: any) => {
            const name = (u.countries as any)?.name || 'Other';
            usersByCountryMap[name] = (usersByCountryMap[name] || 0) + 1;
        });

        // Applications Grouping by Industry
        let appsByIndustryRaw: any[] | null = null;
        try {
            const { data: appsData } = await supabaseAdmin
                .from('applications')
                .select('jobs!job_pk(job_types:job_type_pk(name))');
            appsByIndustryRaw = appsData;
        } catch {}

        const appsByIndustryMap: Record<string, number> = {};
        appsByIndustryRaw?.forEach((a: any) => {
            const name = (a.jobs as any)?.job_types?.name || 'General Tech';
            appsByIndustryMap[name] = (appsByIndustryMap[name] || 0) + 1;
        });

        // Status Grouping
        const { data: appsByStatusRaw } = await supabaseAdmin
            .from('applications')
            .select('status_id');

        const statusMap: Record<number, string> = {
            1: 'Applied',
            2: 'Profile Viewed',
            3: 'Not Suitable',
            4: 'Selected',
            5: 'Accepted',
            6: 'Referred',
            7: 'Interviewing',
            8: 'Offer Received',
            9: 'Hired',
            13: 'Verified Referral'
        };

        const appsByStatusMap: Record<string, number> = {};
        appsByStatusRaw?.forEach((a: any) => {
            const name = statusMap[a.status_id] || 'Other';
            appsByStatusMap[name] = (appsByStatusMap[name] || 0) + 1;
        });

        const formatMap = (map: Record<string, number>) => 
            Object.entries(map).map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

        const directJobsChartData = formatMap(directJobsByIndustryMap);
        const referralJobsChartData = formatMap(referralJobsByIndustryMap);
        const usersCountryChartData = formatMap(usersByCountryMap);
        const appsIndustryChartData = formatMap(appsByIndustryMap);
        const appsStatusChartData = formatMap(appsByStatusMap);

        return NextResponse.json({
            totalJobSeekers,
            totalRecruiters,
            totalDirectJobs: totalDirectJobsResult,
            totalReferralJobs,
            totalApplications,
            periodJobSeekers,
            periodRecruiters,
            periodApplications,
            directJobsByIndustry: directJobsChartData,
            referralJobsByIndustry: referralJobsChartData,
            usersByCountry: usersCountryChartData,
            applicationsByIndustry: appsIndustryChartData,
            applicationsByStatus: appsStatusChartData,
            // Aliases for compatibility
            directJobsByDomain: directJobsChartData,
            referralJobsByDomain: referralJobsChartData,
            usersByDomain: usersCountryChartData,
            applicationsByDomain: appsIndustryChartData
        });

    } catch (e: any) {
        console.error('[API_ANALYTICS_GET] Error:', e);
        return NextResponse.json({ 
            error: 'Failed to fetch analytics', 
            details: e.message 
        }, { status: 500 });
    }
}


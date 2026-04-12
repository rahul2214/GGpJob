import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdmin } from '@/lib/check-admin';

export const dynamic = 'force-dynamic';

const statusMap: { [key: number]: string } = {
    1: 'Applied',
    2: 'Profile Viewed',
    3: 'Not Suitable',
    4: 'Selected',
};

async function getCount(table: string, filter?: any) {
    let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    if (filter) {
        Object.entries(filter).forEach(([key, val]) => {
            query = query.eq(key, val);
        });
    }
    const { count } = await query;
    return count || 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // 1. Parallel Count Queries
    const [
        jobSeekersCount,
        recruitersCount,
        employeesCount,
        directJobsCount,
        referralJobsCount,
        totalApplications
    ] = await Promise.all([
        getCount('jobseekers'),
        getCount('recruiters'),
        getCount('employees'),
        getCount('jobs', { is_referral: false }),
        getCount('jobs', { is_referral: true }),
        getCount('applications')
    ]);

    // 2. Group By Domain Queries (using RPC or complex selects)
    // For simplicity and robustness, we use a custom query or multiple parallel grouping fetches
    
    // Jobs by Domain
    const { data: jobsByDomainRaw } = await supabaseAdmin
        .from('jobs')
        .select('is_referral, domains(name)');
    
    const directJobsByDomainMap: Record<string, number> = {};
    const referralJobsByDomainMap: Record<string, number> = {};
    
    jobsByDomainRaw?.forEach((j: any) => {
        const name = j.domains?.name || 'Other';
        if (j.is_referral) referralJobsByDomainMap[name] = (referralJobsByDomainMap[name] || 0) + 1;
        else directJobsByDomainMap[name] = (directJobsByDomainMap[name] || 0) + 1;
    });

    // Users by Domain (only job seekers have domain_id)
    const { data: usersByDomainRaw } = await supabaseAdmin
        .from('jobseekers')
        .select('domains(name)');

    const usersByDomainMap: Record<string, number> = {};
    usersByDomainRaw?.forEach((u: any) => {
        const name = u.domains?.name || 'Other';
        usersByDomainMap[name] = (usersByDomainMap[name] || 0) + 1;
    });

    // Applications by Domain
    const { data: appsByDomainRaw } = await supabaseAdmin
        .from('applications')
        .select('jobs(domains(name))');

    const appsByDomainMap: Record<string, number> = {};
    appsByDomainRaw?.forEach((a: any) => {
        const name = a.jobs?.domains?.name || 'Other';
        appsByDomainMap[name] = (appsByDomainMap[name] || 0) + 1;
    });

    // Applications by Status
    const { data: statusCountsRaw } = await supabaseAdmin
        .from('applications')
        .select('status_id');

    const statusCountsMap: Record<string, number> = {};
    statusCountsRaw?.forEach((a: any) => {
        const name = statusMap[a.status_id] || 'Unknown';
        statusCountsMap[name] = (statusCountsMap[name] || 0) + 1;
    });

    const analyticsData = {
      totalJobSeekers: jobSeekersCount,
      totalRecruiters: recruitersCount,
      totalEmployees: employeesCount,
      totalDirectJobs: directJobsCount,
      totalReferralJobs: referralJobsCount,
      totalApplications: totalApplications,
      directJobsByDomain: Object.entries(directJobsByDomainMap).map(([name, value]) => ({ name, value })),
      referralJobsByDomain: Object.entries(referralJobsByDomainMap).map(([name, value]) => ({ name, value })),
      usersByDomain: Object.entries(usersByDomainMap).map(([name, value]) => ({ name, value })),
      applicationsByDomain: Object.entries(appsByDomainMap).map(([name, value]) => ({ name, value })),
      applicationsByStatus: Object.entries(statusCountsMap).map(([name, value]) => ({ name, value })),
    };
    
    return NextResponse.json(analyticsData);
  } catch (e: any) {
    console.error('[API_ANALYTICS] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch analytics data', details: e.message }, { status: 500 });
  }
}

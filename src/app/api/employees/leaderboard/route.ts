import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

async function calculateSuccessRates(employees: any[]) {
    if (!employees || !employees.length) return [];
    const employeePks = employees.map(e => e.id).filter(Boolean);
    if (!employeePks.length) return employees;

    const { data: jobs } = await supabaseAdmin.from('jobs').select('id, employee_pk').in('employee_pk', employeePks);
    const jobMap = new Map<number, number>(); // job_pk -> employee_pk
    jobs?.forEach(j => jobMap.set(j.id, j.employee_pk));
    
    const jobIds = Array.from(jobMap.keys());
    const empTotalApps: Record<number, number> = {};
    const empResponseTimes: Record<number, number[]> = {};

    if (jobIds.length > 0) {
        const { data: apps } = await supabaseAdmin.from('applications').select('job_pk, status_id, response_time_seconds').in('job_pk', jobIds);
        apps?.forEach(a => {
            const empPk = jobMap.get(a.job_pk);
            if (empPk) {
                empTotalApps[empPk] = (empTotalApps[empPk] || 0) + 1;
                if (a.response_time_seconds !== null && a.response_time_seconds !== undefined) {
                    if (!empResponseTimes[empPk]) {
                        empResponseTimes[empPk] = [];
                    }
                    empResponseTimes[empPk].push(a.response_time_seconds);
                }
            }
        });
    }

    return employees.map(emp => {
        const total = empTotalApps[emp.id] || 0;
        const verified = emp.verified_referrals_count || 0;
        let success_rate = total > 0 ? Math.min(100, Math.round((verified / total) * 100)) : (verified > 0 ? 100 : 0);
        
        const times = empResponseTimes[emp.id] || [];
        const avg_response_time = times.length > 0
            ? Math.round(times.reduce((sum, val) => sum + val, 0) / times.length)
            : null;

        return {
            ...emp,
            success_rate,
            avg_response_time
        };
    });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'xp'; // xp | trust | success
    const period = searchParams.get('period') || 'all'; // all | monthly

    let leaderboard: any[] = [];

    if (period === 'monthly') {
        // Calculate monthly XP from notifications
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: recentXp, error: xpErr } = await supabaseAdmin
            .from('notifications')
            .select('user_pk, message')
            .eq('type', 'xp_award')
            .gt('created_at', thirtyDaysAgo.toISOString());

        if (xpErr) throw xpErr;

        const monthlyXpMap: Record<number, number> = {};
        recentXp.forEach(n => {
            const match = n.message.match(/\+(\d+)\s*XP/);
            if (match) {
                const val = parseInt(match[1]);
                monthlyXpMap[n.user_pk] = (monthlyXpMap[n.user_pk] || 0) + val;
            }
        });

        // Fetch user details for these users
        const userPks = Object.keys(monthlyXpMap).map(Number);
        const { data: users, error: userErr } = await supabaseAdmin
            .from('employees')
            .select('id, uuid, name, company_name, xp, level, designation, company_logo, trust_score, verified_referrals_count')
            .in('id', userPks);

        if (userErr) throw userErr;

        const usersWithRates = await calculateSuccessRates(users || []);
        leaderboard = usersWithRates.map(u => ({
            ...u,
            xp: monthlyXpMap[(u as any).id] || 0, // In monthly view, XP column shows monthly XP
        }));

    } else {
        let query = supabaseAdmin
          .from('employees')
          .select('id, uuid, name, company_name, xp, level, designation, company_logo, trust_score, verified_referrals_count');

        if (sortBy === 'trust') {
            query = query.order('trust_score', { ascending: false });
        } else if (sortBy === 'success') {
            query = query.order('verified_referrals_count', { ascending: false });
        } else {
            query = query.order('xp', { ascending: false });
        }

        const limitCount = sortBy === 'speed' ? 100 : 20;
        const { data: topEmployees, error } = await query.limit(limitCount);
        if (error) throw error;

        leaderboard = await calculateSuccessRates(topEmployees || []);
    }

    // Final sorting based on sortBy
    if (sortBy === 'success') {
        leaderboard = leaderboard.sort((a, b) => (b.success_rate - a.success_rate));
    } else if (sortBy === 'trust') {
        leaderboard = leaderboard.sort((a, b) => (b.trust_score - a.trust_score));
    } else if (sortBy === 'speed') {
        leaderboard = leaderboard.sort((a, b) => {
            const aTime = a.avg_response_time;
            const bTime = b.avg_response_time;
            if (aTime === null && bTime === null) return 0;
            if (aTime === null) return 1;
            if (bTime === null) return -1;
            return aTime - bTime;
        });
    } else {
        leaderboard = leaderboard.sort((a, b) => (b.xp - a.xp));
    }

    // Add final rank
    const rankedLeaderboard = leaderboard.slice(0, 15).map((emp, index) => ({
        ...emp,
        rank: index + 1
    }));

    return NextResponse.json(rankedLeaderboard);
  } catch (e: any) {
    console.error('[API_LEADERBOARD] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

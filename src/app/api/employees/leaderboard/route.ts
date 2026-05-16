
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
            .select('uuid, name, company_name, xp, level, designation, company_logo, trust_score, interviews_count, hires_count, verified_referrals_count')
            .in('id', userPks);

        if (userErr) throw userErr;

        leaderboard = (users || []).map(u => ({
            ...u,
            xp: monthlyXpMap[(u as any).id] || 0, // In monthly view, XP column shows monthly XP
            success_rate: (u.interviews_count || 0) > 0 ? Math.round(((u.hires_count || 0) / u.interviews_count) * 100) : 0
        }));

    } else {
        let query = supabaseAdmin
          .from('employees')
          .select('uuid, name, company_name, xp, level, designation, company_logo, trust_score, interviews_count, hires_count, verified_referrals_count');

        if (sortBy === 'trust') {
            query = query.order('trust_score', { ascending: false });
        } else if (sortBy === 'success') {
            query = query.order('verified_referrals_count', { ascending: false });
        } else {
            query = query.order('xp', { ascending: false });
        }

        const { data: topEmployees, error } = await query.limit(20);
        if (error) throw error;

        leaderboard = (topEmployees || []).map((emp) => {
          const interviewCount = emp.interviews_count || 0;
          const hireCount = emp.hires_count || 0;
          return {
            ...emp,
            success_rate: interviewCount > 0 ? Math.round((hireCount / interviewCount) * 100) : 0
          };
        });
    }

    // Final sorting based on sortBy
    if (sortBy === 'success') {
        leaderboard = leaderboard.sort((a, b) => (b.success_rate - a.success_rate));
    } else if (sortBy === 'trust') {
        leaderboard = leaderboard.sort((a, b) => (b.trust_score - a.trust_score));
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

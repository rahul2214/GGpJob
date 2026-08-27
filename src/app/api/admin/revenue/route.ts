import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    // Fetch all records from 'payments' table
    const { data: paymentsRaw, error: pErr } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('timestamp', { ascending: false });

    if (pErr) throw pErr;

    const payments = paymentsRaw || [];

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
    const totalTransactions = payments.length;
    const paidTransactions = payments.filter((p: any) => (Number(p.amount) || 0) > 0);
    const paidCount = paidTransactions.length;
    const averageOrderValue = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

    // Unique paying users
    const uniqueUsers = new Set(payments.map((p: any) => p.user_id).filter(Boolean)).size;

    // Group by Plan ID
    const planMap: Record<string, number> = {};
    const planCounts: Record<string, number> = {};
    payments.forEach((p: any) => {
        const plan = p.plan_id || 'unspecified';
        planMap[plan] = (planMap[plan] || 0) + (Number(p.amount) || 0);
        planCounts[plan] = (planCounts[plan] || 0) + 1;
    });

    const revenueByPlan = Object.entries(planMap).map(([name, value]) => ({
        name: name.toUpperCase(),
        value,
        count: planCounts[name] || 0
    })).sort((a, b) => b.value - a.value);

    // Group by Month
    const monthMap: Record<string, { revenue: number; transactions: number }> = {};
    payments.forEach((p: any) => {
        const date = p.timestamp ? new Date(p.timestamp) : new Date();
        const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (!monthMap[monthKey]) {
            monthMap[monthKey] = { revenue: 0, transactions: 0 };
        }
        monthMap[monthKey].revenue += (Number(p.amount) || 0);
        monthMap[monthKey].transactions += 1;
    });

    const monthlyTrend = Object.entries(monthMap).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        payouts: 0,
        profit: data.revenue,
        transactions: data.transactions
    }));

    return NextResponse.json({
        totalRevenue,
        totalPayouts: 0,
        pendingPayouts: 0,
        pendingPayoutsCount: 0,
        netRevenue: totalRevenue,
        totalTransactions,
        paidTransactions: paidCount,
        freeOrDiscountedTransactions: totalTransactions - paidCount,
        averageOrderValue,
        uniquePayingUsers: uniqueUsers,
        revenueByPlan,
        monthlyTrend,
        recentPayments: payments.slice(0, 15)
    });
  } catch (e: any) {
    console.error('[API_ADMIN_REVENUE_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch revenue data', details: e.message }, { status: 500 });
  }
}

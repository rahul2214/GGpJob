import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST /api/subscription/cron
// Daily cron job: expire subscriptions, archive jobs after grace period
// Secured via CRON_SECRET header
export async function POST(request: NextRequest) {
  try {
    // Simple auth check for cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'cron-secret-default';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();
    const results: string[] = [];

    // 1. Mark expired subscriptions
    const { data: newlyExpired, error: expireError } = await supabaseAdmin
      .from('recruiters')
      .update({
        subscription_status: 'expired',
        grace_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .lt('plan_expires_at', now)
      .eq('subscription_status', 'active')
      .neq('plan_type', 'none')
      .select('id, uuid, email, name');

    if (expireError) {
      console.error('[CRON] Error expiring subscriptions:', expireError);
    } else {
      results.push(`Expired ${newlyExpired?.length || 0} subscriptions`);
    }

    // 2. Archive jobs for recruiters past grace period
    const { data: pastGrace, error: graceError } = await supabaseAdmin
      .from('recruiters')
      .select('id')
      .eq('subscription_status', 'expired')
      .lt('grace_period_end', now);

    if (graceError) {
      console.error('[CRON] Error fetching past-grace recruiters:', graceError);
    } else if (pastGrace && pastGrace.length > 0) {
      const recruiterPks = pastGrace.map((r: any) => r.id);

      const { count, error: archiveError } = await supabaseAdmin
        .from('jobs')
        .update({ status: 'archived' })
        .in('recruiter_pk', recruiterPks)
        .eq('status', 'active')
        .select('id', { count: 'exact', head: true });

      if (archiveError) {
        console.error('[CRON] Error archiving jobs:', archiveError);
      } else {
        results.push(`Archived ${count || 0} jobs for ${recruiterPks.length} recruiters past grace period`);
      }
    }

    // 3. Send expiry warning emails (via notifications table for now)
    // 7 days before expiry
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const in6Days = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: expiringIn7 } = await supabaseAdmin
      .from('recruiters')
      .select('id, uuid, email, name')
      .eq('subscription_status', 'active')
      .gt('plan_expires_at', in6Days)
      .lte('plan_expires_at', in7Days);

    if (expiringIn7 && expiringIn7.length > 0) {
      for (const r of expiringIn7) {
        await supabaseAdmin.from('notifications').insert({
          user_id: r.id,
          type: 'subscription_expiring',
          title: 'Subscription expiring soon',
          body: 'Your JobsDart subscription expires in 7 days. Renew now to avoid interruptions.',
          data: { route: '/company/payment?upgrade=true' },
        });
      }
      results.push(`Sent 7-day warnings to ${expiringIn7.length} recruiters`);
    }

    // 3 days before expiry
    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: expiringIn3 } = await supabaseAdmin
      .from('recruiters')
      .select('id, uuid, email, name')
      .eq('subscription_status', 'active')
      .gt('plan_expires_at', in2Days)
      .lte('plan_expires_at', in3Days);

    if (expiringIn3 && expiringIn3.length > 0) {
      for (const r of expiringIn3) {
        await supabaseAdmin.from('notifications').insert({
          user_id: r.id,
          type: 'subscription_expiring',
          title: 'Subscription expiring in 3 days',
          body: 'Your recruiter plan expires in 3 days. Renew to keep your jobs visible.',
          data: { route: '/company/payment?upgrade=true' },
        });
      }
      results.push(`Sent 3-day warnings to ${expiringIn3.length} recruiters`);
    }

    // 1 day before expiry
    const in1Day = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: expiringIn1 } = await supabaseAdmin
      .from('recruiters')
      .select('id, uuid, email, name')
      .eq('subscription_status', 'active')
      .gt('plan_expires_at', now)
      .lte('plan_expires_at', in1Day);

    if (expiringIn1 && expiringIn1.length > 0) {
      for (const r of expiringIn1) {
        await supabaseAdmin.from('notifications').insert({
          user_id: r.id,
          type: 'subscription_expiring',
          title: 'Final reminder: Subscription expires tomorrow',
          body: 'Your JobsDart subscription expires tomorrow. Renew now to avoid losing access.',
          data: { route: '/company/payment?upgrade=true' },
        });
      }
      results.push(`Sent 1-day warnings to ${expiringIn1.length} recruiters`);
    }

    // On expiry notification (for newly expired this run)
    if (newlyExpired && newlyExpired.length > 0) {
      for (const r of newlyExpired) {
        await supabaseAdmin.from('notifications').insert({
          user_id: r.id,
          type: 'subscription_expired',
          title: 'Your subscription has expired',
          body: 'Your jobs will remain visible for the next 7 days. Renew now to avoid them being archived.',
          data: { route: '/company/payment?upgrade=true' },
        });
      }
      results.push(`Sent expiry notifications to ${newlyExpired.length} recruiters`);
    }

    // 2 days before archive (grace period ending)
    const graceIn2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const graceIn1Day = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString();

    const { data: almostArchived } = await supabaseAdmin
      .from('recruiters')
      .select('id, uuid, email, name')
      .eq('subscription_status', 'expired')
      .gt('grace_period_end', graceIn1Day)
      .lte('grace_period_end', graceIn2Days);

    if (almostArchived && almostArchived.length > 0) {
      for (const r of almostArchived) {
        await supabaseAdmin.from('notifications').insert({
          user_id: r.id,
          type: 'jobs_archiving_soon',
          title: 'Only 2 days left before your jobs are archived',
          body: 'Renew your subscription now to keep your job postings active and visible.',
          data: { route: '/company/payment?upgrade=true' },
        });
      }
      results.push(`Sent archive warnings to ${almostArchived.length} recruiters`);
    }

    return NextResponse.json({ success: true, results });
  } catch (e: any) {
    console.error('[CRON] Subscription cron error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

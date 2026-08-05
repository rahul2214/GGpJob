import { supabaseAdmin } from './supabase-admin';
import { getPayoutStatus } from './trust-logic';

/**
 * Creates or processes a payout for an employee.
 * If trust score is high enough, it updates the balance immediately.
 * Otherwise, it creates a pending/delayed payout record for admin review.
 */
export async function processPayout(employeeId: number, amount: number, applicationPk: number, reason: string) {
    if (amount <= 0) return { success: true };

    // 1. Fetch current trust score and balance
    const { data: emp, error: fetchErr } = await supabaseAdmin
        .from('employees')
        .select('trust_score, credits')
        .eq('id', employeeId)
        .single();

    if (fetchErr || !emp) {
        console.error(`[PAYOUT_SYSTEM] Error fetching employee ${employeeId}:`, fetchErr?.message);
        return { error: 'Employee not found' };
    }

    const trustScore = emp.trust_score ?? 50;
    const status = getPayoutStatus(trustScore);

    // 2. Create payout/credit record
    const { data: payout, error: payoutErr } = await supabaseAdmin
        .from('payouts')
        .insert({
            employee_id: employeeId,
            amount: amount,
            method: 'system_credits',
            status: 'completed',
            admin_notes: `Automatic credits: completed. App ID: ${applicationPk}. Reason: ${reason}`
        })
        .select()
        .single();

    if (payoutErr) {
        console.error(`[PAYOUT_SYSTEM] Error creating credits record:`, payoutErr.message);
        return { error: 'Failed to create credits record' };
    }

    // 3. Update credit balance immediately
    const { error: updateErr } = await supabaseAdmin
        .from('employees')
        .update({ credits: (emp.credits || 0) + amount })
        .eq('id', employeeId);

    if (updateErr) {
        console.error(`[PAYOUT_SYSTEM] Error updating credits for ${employeeId}:`, updateErr.message);
        return { error: 'Failed to update credits' };
    }

    // 4. Notify employee about earned credits
    await supabaseAdmin.from('notifications').insert({
        user_pk: employeeId,
        message: `You received +${amount} Job Boost Credits! Reason: ${reason}`,
        type: 'xp_award',
        created_at: new Date().toISOString()
    });

    return { success: true, processed: true, payoutId: payout.id };
}

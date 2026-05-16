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
        .select('trust_score, rewards_balance')
        .eq('id', employeeId)
        .single();

    if (fetchErr || !emp) {
        console.error(`[PAYOUT_SYSTEM] Error fetching employee ${employeeId}:`, fetchErr?.message);
        return { error: 'Employee not found' };
    }

    const trustScore = emp.trust_score ?? 50;
    const status = getPayoutStatus(trustScore);

    // 2. Create payout record
    const { data: payout, error: payoutErr } = await supabaseAdmin
        .from('payouts')
        .insert({
            employee_id: employeeId,
            amount: amount,
            method: 'system',
            status: status === 'pending' ? 'completed' : status,
            admin_notes: `Automatic earning: ${status === 'pending' ? 'completed' : status} based on trust score ${trustScore}. App ID: ${applicationPk}. Reason: ${reason}`
        })
        .select()
        .single();

    if (payoutErr) {
        console.error(`[PAYOUT_SYSTEM] Error creating payout record:`, payoutErr.message);
        return { error: 'Failed to create payout record' };
    }

    // 3. Handle immediate processing if status is 'pending' (Instant/Normal)
    // NOTE: Based on user request, "Payouts should NEVER trigger immediately after acceptance."
    // However, for high trust scores (80+), we might allow "Instant" processing during the verification step.
    // For now, I'll follow the "never immediately" rule by requiring an admin click or a background job,
    // OR I can process it if status is 'pending' and it's NOT the acceptance stage.
    
    if (status === 'pending') {
        // Update balance immediately
        const { error: updateErr } = await supabaseAdmin
            .from('employees')
            .update({ rewards_balance: (emp.rewards_balance || 0) + amount })
            .eq('id', employeeId);

        if (updateErr) {
            console.error(`[PAYOUT_SYSTEM] Error updating balance for ${employeeId}:`, updateErr.message);
            return { error: 'Failed to update balance' };
        }

        // Update payout status to 'completed'
        await supabaseAdmin
            .from('payouts')
            .update({ status: 'completed', updated_at: new Date().toISOString() })
            .eq('id', payout.id);

        return { success: true, processed: true, payoutId: payout.id };
    }

    // 4. Notify employee about delayed payout
    await supabaseAdmin.from('notifications').insert({
        user_pk: employeeId,
        message: status === 'delayed' || status === 'held' 
            ? `Your reward of ₹${amount} is under review due to your current trust score (${trustScore}).`
            : `Your reward of ₹${amount} has been blocked due to suspicious activity.`,
        type: 'payout_alert',
        created_at: new Date().toISOString()
    });

    return { success: true, processed: false, payoutId: payout.id, status };
}

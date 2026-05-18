import { supabaseAdmin } from './supabase-admin';

export type TrustReason = 
    | 'VERIFIED_REFERRAL' 
    | 'VERIFIED_INTERVIEW' 
    | 'SUCCESSFUL_HIRE' 
    | 'POSITIVE_FEEDBACK'
    | 'REPEATED_PAIR'
    | 'MISSING_PROOF'
    | 'FAKE_ACTIVITY'
    | 'SPAM_BEHAVIOR'
    | 'MULTI_ACCOUNT_ABUSE'
    | 'DISPUTE_REFUND';

const TRUST_DELTAS: Record<TrustReason, number> = {
    VERIFIED_REFERRAL: 2,
    VERIFIED_INTERVIEW: 5,
    SUCCESSFUL_HIRE: 10,
    POSITIVE_FEEDBACK: 3,
    REPEATED_PAIR: -10,
    MISSING_PROOF: -15,
    FAKE_ACTIVITY: -25,
    SPAM_BEHAVIOR: -15,
    MULTI_ACCOUNT_ABUSE: -40,
    DISPUTE_REFUND: 25
};

/**
 * Updates an employee's trust score and logs the history.
 */
export async function updateTrustScore(employeeId: number, reason: TrustReason, notes?: string) {
    const delta = TRUST_DELTAS[reason];
    
    // 1. Fetch current score
    const { data: emp, error: fetchErr } = await supabaseAdmin
        .from('employees')
        .select('trust_score')
        .eq('id', employeeId)
        .single();

    if (fetchErr || !emp) {
        console.error(`[TRUST_SYSTEM] Error fetching employee ${employeeId}:`, fetchErr?.message);
        return { error: 'Employee not found' };
    }

    const oldScore = emp.trust_score ?? 50;
    const newScore = Math.max(0, Math.min(100, oldScore + delta));

    if (oldScore === newScore && delta !== 0) {
        return { success: true, score: newScore, unchanged: true };
    }

    // 2. Update employee
    const { error: updateErr } = await supabaseAdmin
        .from('employees')
        .update({ trust_score: newScore })
        .eq('id', employeeId);

    if (updateErr) {
        console.error(`[TRUST_SYSTEM] Error updating score for ${employeeId}:`, updateErr.message);
        return { error: 'Failed to update score' };
    }

    // 3. Log history
    await supabaseAdmin
        .from('trust_score_history')
        .insert({
            employee_id: employeeId,
            delta: delta,
            new_score: newScore,
            reason: reason + (notes ? `: ${notes}` : '')
        });

    console.log(`[TRUST_SYSTEM] Employee ${employeeId} score: ${oldScore} -> ${newScore} (${reason})`);
    return { success: true, score: newScore };
}

/**
 * Determines the payout status based on trust score.
 */
export function getPayoutStatus(trustScore: number): 'pending' | 'delayed' | 'held' | 'blocked' {
    if (trustScore >= 80) return 'pending'; // Instant (will be processed immediately in caller)
    if (trustScore >= 60) return 'pending'; // Normal
    if (trustScore >= 40) return 'delayed';
    if (trustScore >= 20) return 'held';
    return 'blocked';
}

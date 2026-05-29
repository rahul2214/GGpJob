import { supabaseAdmin } from './supabase-admin';
import { updateTrustScore } from './trust-logic';

/**
 * Checks for suspicious activity and penalizes trust score if found.
 */
export async function checkForFraud(employeePk: number, jobseekerPk: number, jobPk: number) {
    try {
        // 1. Repeated Pair Check: Have they referred each other multiple times recently?
        const { count: pairCount } = await supabaseAdmin
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .eq('user_pk', jobseekerPk)
            .eq('job_pk', jobPk); // Check if they already applied to THIS job (redundant but safe)

        // Check total referrals between this pair
        const { count: totalPairCount } = await supabaseAdmin
            .from('applications')
            .select('id', { count: 'exact', head: true })
            .eq('user_pk', jobseekerPk)
            .neq('id', 0) // Dummy to allow filter
            .filter('job_pk', 'in', `(SELECT id FROM jobs WHERE employee_pk = ${employeePk})`);

        if ((totalPairCount || 0) > 3) {
            console.warn(`[FRAUD_DETECTION] High frequency pair detected: Emp ${employeePk} -> Seek ${jobseekerPk}`);
            await updateTrustScore(employeePk, 'REPEATED_PAIR', `Repeated referrals for same jobseeker (${totalPairCount} times)`);
            return { suspicious: true, reason: 'REPEATED_PAIR' };
        }

        // 2. Instant Acceptance Check: Did the employee accept the application within seconds of it being created?
        // (This would require fetching the application creation time vs acceptance time)
        // For now, we'll leave this as a placeholder for a more complex time-diff check.

        return { suspicious: false };
    } catch (err) {
        console.error('[FRAUD_DETECTION] Error:', err);
        return { error: 'Detection failed' };
    }
}

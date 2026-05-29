
// src/lib/gamification-logic.ts
import { supabaseAdmin } from './supabase-admin';
import { updateTrustScore, TrustReason } from './trust-logic';
import { processPayout } from './payout-logic';

export const ACTION_XP = {
    JOB_POSTED: 5,
    CANDIDATE_ACCEPTED: 10,
    REFERRAL_VERIFIED: 20,
    CANDIDATE_INTERVIEW: 15,
    CANDIDATE_JOINED: 50,
    OFFER_RECEIVED: 30
};

export const MILESTONES = [
    { 
        id: 'level_2_bonus', 
        label: 'Level 2: Getting Started', 
        target_level: 2, 
        type: 'level', 
        reward: 200,
        notification: 'Congratulations! 🏆 Reached Level 2. ₹200 bonus added to your wallet!'
    },
    { 
        id: 'level_3_bonus', 
        label: 'Level 3: Competent Referrer', 
        target_level: 3, 
        type: 'level', 
        reward: 500,
        notification: 'Congratulations! 🏆 Reached Level 3. ₹500 bonus added to your wallet!'
    },
    { 
        id: 'level_4_bonus', 
        label: 'Level 4: Skilled Referrer', 
        target_level: 4, 
        type: 'level', 
        reward: 500,
        notification: 'Congratulations! 🏆 Reached Level 4: Skilled Referrer. ₹500 bonus added to your wallet!'
    },
    { 
        id: 'level_5_bonus', 
        label: 'Level 5: Trusted Referrer', 
        target_level: 5, 
        type: 'level', 
        reward: 1000,
        notification: 'Amazing milestone! 🚀 Reached Level 5: Trusted Referrer. ₹1000 reward added!'
    },
    { 
        id: 'level_6_bonus', 
        label: 'Level 6: Advanced Referrer', 
        target_level: 6, 
        type: 'level', 
        reward: 1500,
        notification: 'Level 6 achieved! ⚡ ₹500 bonus unlocked for strong performance.'
    },
    { 
        id: 'level_7_bonus', 
        label: 'Level 7: Expert Referrer', 
        target_level: 7, 
        type: 'level', 
        reward: 3000,
        notification: 'Elite status! 🟠 Reached Level 7: Expert Referrer. ₹3000 bonus added to your balance.'
    },
    { 
        id: 'level_8_bonus', 
        label: 'Level 8: Elite Referrer', 
        target_level: 8, 
        type: 'level', 
        reward: 5000,
        notification: 'Incredible! 💎 Reached Level 8: Elite Referrer. ₹5000 reward added to your wallet.'
    },
    { 
        id: 'level_9_bonus', 
        label: 'Level 9: Referral Master', 
        target_level: 9, 
        type: 'level', 
        reward: 10000,
        notification: 'Master Status! 🔴 Reached Level 9: Referral Master. ₹10,000 major reward added!'
    },
    { 
        id: 'level_10_bonus', 
        label: 'Level 10: Legend Referrer', 
        target_level: 10, 
        type: 'level', 
        reward: 0, // Handled as annual/special
        notification: '👑 LEGENDARY! You have reached Level 10. You are now eligible for the annual bonus pool and permanent recognition.'
    }
];

export const COUNT_MILESTONES = [
    // Verified Referrals
    { id: 'referrals_20', field: 'verified_referrals_count', target: 20, xp: 150, badge: 'Connector', notification: 'Achievement Unlocked: Connector 🎖️ (20 Verified Referrals)' },
    { id: 'referrals_50', field: 'verified_referrals_count', target: 50, xp: 400, notification: 'Achievement Unlocked: 50 Verified Referrals! +400 XP' },
    { id: 'referrals_100', field: 'verified_referrals_count', target: 100, xp: 1000, notification: 'Achievement Unlocked: 100 Verified Referrals! +1000 XP' },
]

export async function awardXP(employeeId: string | number, action: keyof typeof ACTION_XP, jobPk?: number) {
    console.log(`[GAMIFICATION] awardXP called for employee: ${employeeId}, action: ${action}`);
    const baseXP = ACTION_XP[action];
    if (baseXP === undefined) return { error: 'Invalid action' };

    try {
        const { data: emp, error: fetchErr } = await supabaseAdmin
            .from('employees')
            .select('xp, level, milestones_achieved, rewards_balance, verified_referrals_count, badge_ids')
            .eq('id', employeeId)
            .single();

        if (fetchErr || !emp) {
            console.error('[GAMIFICATION] Employee fetch error:', fetchErr?.message);
            throw new Error(fetchErr?.message || 'Employee not found');
        }

        let totalXpToAward = baseXP;
        let balanceUpdate = 0;
        let notifications = [];
        
        const currentMilestones = emp.milestones_achieved || [];
        const newMilestones = [...currentMilestones];
        const currentBadges = emp.badge_ids || [];
        const newBadges = [...currentBadges];

        // 1. Update primary counters
        const updatedCounts: any = {
            verified_referrals_count: emp.verified_referrals_count || 0,
        };

        if (action === 'REFERRAL_VERIFIED') updatedCounts.verified_referrals_count++;
       
        // 2. Check Count-based Milestones
        for (const milestone of COUNT_MILESTONES) {
            if (!newMilestones.includes(milestone.id)) {
                const currentVal = updatedCounts[milestone.field];
                if (currentVal >= milestone.target) {
                    newMilestones.push(milestone.id);
                    totalXpToAward += milestone.xp;
                    notifications.push(milestone.notification);
                    if (milestone.badge && !newBadges.includes(milestone.badge)) {
                        newBadges.push(milestone.badge);
                    }
                }
            }
        }

        // 3. Handle Leveling
        let newXp = (emp.xp || 0) + totalXpToAward;
        let newLevel = emp.level || 1;

        const LEVEL_MAX_XP: Record<number, number> = {
            1: 200, 2: 500, 3: 1000, 4: 1500, 5: 3000, 
            6: 5000, 7: 8000, 8: 12000, 9: 20000, 10: 100000 
        };

        while (newLevel < 10 && newXp >= (LEVEL_MAX_XP[newLevel] || 999999)) {
            newXp = newXp - (LEVEL_MAX_XP[newLevel] || 999999);
            newLevel++;
            
            // Check Level-based Milestones
            for (const milestone of MILESTONES) {
                if (milestone.type === 'level' && milestone.target_level === newLevel && !newMilestones.includes(milestone.id)) {
                    newMilestones.push(milestone.id);
                    balanceUpdate += milestone.reward;
                    notifications.push(milestone.notification);
                }
            }
        }

        const updateData: any = { 
            xp: newXp, 
            level: newLevel,
            ...updatedCounts,
            milestones_achieved: newMilestones,
            badge_ids: newBadges
        };
        
        console.log(`[GAMIFICATION] Committing update for employee ${employeeId}:`, JSON.stringify(updateData));
        
        if (balanceUpdate > 0) {
            await processPayout(Number(employeeId), balanceUpdate, jobPk || 0, `Milestone/Level Reward (${newLevel})`);
        }

        // 4. Commit updates
        const { error: updateErr } = await supabaseAdmin
            .from('employees')
            .update(updateData)
            .eq('id', employeeId);

        if (updateErr) throw updateErr;

        // 5. Send notifications
        const notificationEntries = [
            {
                user_pk: employeeId,
                message: `You earned +${totalXpToAward} XP!`,
                type: 'xp_award',
                job_pk: jobPk,
                created_at: new Date().toISOString()
            },
            ...notifications.map(msg => ({
                user_pk: employeeId,
                message: msg,
                type: 'milestone_reward',
                job_pk: jobPk,
                created_at: new Date().toISOString()
            }))
        ];

        await supabaseAdmin.from('notifications').insert(notificationEntries);

        // 6. Update Trust Score
        let trustReason: TrustReason | null = null;
        if (action === 'REFERRAL_VERIFIED') trustReason = 'VERIFIED_REFERRAL';
        else if (action === 'CANDIDATE_INTERVIEW') trustReason = 'VERIFIED_INTERVIEW';
        
        if (trustReason) {
            await updateTrustScore(Number(employeeId), trustReason);
        }

        return { success: true, xpEarned: totalXpToAward, newLevel, newBalance: updateData.rewards_balance };

    } catch (err: any) {
        console.error('[GAMIFICATION] Error awarding XP:', err);
        return { error: err.message };
    }
}

export async function deductXP(employeeId: string | number, amount: number, jobPk?: number) {
    console.log(`[GAMIFICATION] deductXP called for employee: ${employeeId}, amount: ${amount}`);
    try {
        const { data: emp, error: fetchErr } = await supabaseAdmin
            .from('employees')
            .select('xp, level')
            .eq('id', employeeId)
            .single();

        if (fetchErr || !emp) {
            console.error('[GAMIFICATION] Employee fetch error in deductXP:', fetchErr?.message);
            throw new Error(fetchErr?.message || 'Employee not found');
        }

        let newXp = (emp.xp ) - amount;
        let newLevel = emp.level ;

        const LEVEL_MAX_XP: Record<number, number> = {
            1: 200, 2: 500, 3: 1000, 4: 1500, 5: 3000, 
            6: 5000, 7: 8000, 8: 12000, 9: 20000, 10: 100000 
        };

        while (newXp < 0 && newLevel > 1) {
            newLevel--;
            newXp = (LEVEL_MAX_XP[newLevel]) + newXp;
        }

        if (newLevel === 1 && newXp < 0) {
            newXp = 0;
        }

        const updateData = { xp: newXp, level: newLevel };
        console.log(`[GAMIFICATION] Committing deductXP for employee ${employeeId}:`, JSON.stringify(updateData));

        const { error: updateErr } = await supabaseAdmin
            .from('employees')
            .update(updateData)
            .eq('id', employeeId);

        if (updateErr) throw updateErr;

        await supabaseAdmin.from('notifications').insert({
            user_pk: employeeId,
            message: `Dispute Rejected by Admin. ${amount} XP deducted. Current Level: ${newLevel}.`,
            type: 'penalty',
            job_pk: jobPk,
            created_at: new Date().toISOString()
        });

        return { success: true, newXp, newLevel };
    } catch (err: any) {
        console.error('[GAMIFICATION] Error in deductXP:', err);
        return { error: err.message };
    }
}

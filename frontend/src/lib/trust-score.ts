import { supabaseAdmin } from './supabase-admin';

export async function adjustTrustScore(userId: number, role: 'jobseeker' | 'employee', adjustment: number) {
  const table = role === 'jobseeker' ? 'jobseekers' : 'employees';
  
  // Fetch current score
  const { data, error } = await supabaseAdmin
    .from(table)
    .select('trust_score')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error(`[TRUST_SCORE] Failed to fetch score for ${role} ID ${userId}:`, error);
    return;
  }

  const newScore = Math.max(0, Math.min(100, (data.trust_score) + adjustment));

  const { error: updateError } = await supabaseAdmin
    .from(table)
    .update({ trust_score: newScore })
    .eq('id', userId);

  if (updateError) {
    console.error(`[TRUST_SCORE] Failed to update score for ${role} ID ${userId}:`, updateError);
  } else {
    console.log(`[TRUST_SCORE] Adjusted ${role} ID ${userId} score by ${adjustment} (New: ${newScore})`);
  }
}

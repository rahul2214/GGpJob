import { supabaseAdmin } from './supabase-admin';

/**
 * Checks whether a user (jobseeker or recruiter) has already used/redeemed
 * a specific coupon code by checking their payment and activation records.
 * payments.user_id is a UUID column.
 */
export async function hasUserUsedCoupon(userId: string | number, couponCode: string): Promise<boolean> {
  if (!userId || !couponCode) return false;

  const normalizedCode = couponCode.trim().toUpperCase();
  const isUUID = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

  let targetUUID: string | null = isUUID ? String(userId) : null;

  if (!targetUUID) {
    const lookupId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (!isNaN(lookupId)) {
      try {
        const [
          { data: seeker },
          { data: recruiter }
        ] = await Promise.all([
          supabaseAdmin.from('jobseekers').select('uuid').eq('id', lookupId).maybeSingle(),
          supabaseAdmin.from('recruiters').select('uuid').eq('id', lookupId).maybeSingle()
        ]);
        targetUUID = seeker?.uuid || recruiter?.uuid || null;
      } catch (err) {
        console.error('[HAS_USER_USED_COUPON] Error resolving user UUID:', err);
      }
    }
  }

  if (!targetUUID) return false;

  const { data: existingPayment, error } = await supabaseAdmin
    .from('payments')
    .select('id')
    .ilike('coupon_code', normalizedCode)
    .eq('user_id', targetUUID)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[HAS_USER_USED_COUPON] Error looking up previous payment:', error);
    return false;
  }

  return Boolean(existingPayment);
}

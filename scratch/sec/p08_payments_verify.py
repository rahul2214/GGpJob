import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

patch('src/app/api/payments/verify/route.ts', [

# 1. Razorpay client + stricter PayPal verification
(
r"""import { NextResponse } from 'next/server';
import crypto from 'crypto';""",
r"""import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';"""
),
(
r"""export const dynamic = 'force-dynamic';

async function verifyPayPalOrder(orderId: string): Promise<boolean> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // If PayPal server secrets are not provided in environment, allow verified client receipt only in development
    return process.env.NODE_ENV !== 'production';
  }""",
r"""export const dynamic = 'force-dynamic';

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

async function verifyPayPalOrder(orderId: string): Promise<boolean> {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    // Without server-side PayPal credentials the client receipt cannot be
    // verified, so it is only accepted when a developer explicitly opts in for
    // local testing. Relying on NODE_ENV alone would open the bypass anywhere
    // that variable is not set to "production".
    return (
      process.env.NODE_ENV === 'development' &&
      process.env.ALLOW_UNVERIFIED_PAYPAL_IN_DEV === 'true'
    );
  }"""
),

# 2. Bind entitlement to the order actually paid + replay protection
(
r"""    if (!verified) {
      return NextResponse.json({ success: false, message: "Invalid payment verification signature or unverified order." }, { status: 400 });
    }

    const now = new Date();""",
r"""    if (!verified) {
      return NextResponse.json({ success: false, message: "Invalid payment verification signature or unverified order." }, { status: 400 });
    }

    // A valid signature only proves that *some* order was paid. Re-read the
    // order from Razorpay and confirm it is the order this activation claims,
    // for this plan and this user, and that it was actually captured. Without
    // this a customer could pay for the cheapest plan and then activate any
    // other plan using the same genuine signature.
    if (gateway === 'razorpay') {
      let razorpayOrder: any = null;
      let razorpayPayment: any = null;
      try {
        [razorpayOrder, razorpayPayment] = await Promise.all([
          razorpayClient.orders.fetch(orderId),
          razorpayClient.payments.fetch(paymentId),
        ]);
      } catch (fetchErr) {
        console.error('[PAYMENT_VERIFY] Could not re-read the order from Razorpay:', fetchErr);
        return NextResponse.json(
          { success: false, message: 'Payment could not be confirmed with the payment gateway.' },
          { status: 502 }
        );
      }

      if (!razorpayOrder || !razorpayPayment) {
        return NextResponse.json({ success: false, message: 'Unknown payment order.' }, { status: 400 });
      }

      if (String(razorpayPayment.order_id) !== String(orderId)) {
        return NextResponse.json({ success: false, message: 'Payment does not belong to this order.' }, { status: 400 });
      }

      if (!['captured', 'authorized'].includes(String(razorpayPayment.status))) {
        return NextResponse.json(
          { success: false, message: `Payment is not complete (status: ${razorpayPayment.status}).` },
          { status: 400 }
        );
      }

      const orderNotes = (razorpayOrder.notes || {}) as Record<string, string>;

      if (!orderNotes.planId || String(orderNotes.planId) !== String(planId)) {
        return NextResponse.json(
          { success: false, message: 'The plan requested does not match the plan that was paid for.' },
          { status: 400 }
        );
      }

      if (orderNotes.userId && String(orderNotes.userId) !== String(userId)) {
        return NextResponse.json(
          { success: false, message: 'This payment belongs to a different account.' },
          { status: 403 }
        );
      }
    }

    // Replay protection: a payment reference may only ever grant entitlement
    // once. The reservation row is written before anything is granted, and a
    // unique index on payments.payment_id makes concurrent replays lose.
    const { data: alreadyProcessed } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('payment_id', paymentId)
      .maybeSingle();

    if (alreadyProcessed) {
      return NextResponse.json(
        { success: true, message: 'This payment has already been applied.', duplicate: true },
        { status: 200 }
      );
    }

    const now = new Date();"""
),

# 3. Coupon: apply the same validity rules used at order time, and increment atomically
(
r"""      if (coupon) {
        const isValid = coupon.applicable_plan === 'all' || coupon.applicable_plan === planId || !coupon.applicable_plan;
        if (isValid) {
          finalAmountUSD = Math.max(0, finalAmountUSD * (1 - coupon.discount_percent / 100));
          appliedCouponCode = coupon.code;

          await supabaseAdmin
            .from('coupons')
            .update({ current_uses: (coupon.current_uses || 0) + 1 })
            .eq('id', coupon.id);
        }
      }""",
r"""      if (coupon) {
        // Apply the same validity rules enforced when the order was created —
        // active, unexpired, within its usage cap and applicable to this plan.
        // Checking only the plan here let expired or exhausted coupons through.
        const planMatches =
          coupon.applicable_plan === 'all' || coupon.applicable_plan === planId || !coupon.applicable_plan;
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) >= new Date();
        const underUseCap =
          coupon.max_uses === null || coupon.max_uses === undefined || (coupon.current_uses || 0) < coupon.max_uses;
        const isValid = planMatches && notExpired && underUseCap && coupon.is_active !== false;

        if (isValid) {
          // Claim a redemption before honouring the discount. The update only
          // matches while the count is still what we read, so two concurrent
          // redemptions cannot both slip past the cap.
          const { data: redeemed } = await supabaseAdmin
            .from('coupons')
            .update({ current_uses: (coupon.current_uses || 0) + 1 })
            .eq('id', coupon.id)
            .eq('current_uses', coupon.current_uses || 0)
            .select('id');

          if (Array.isArray(redeemed) && redeemed.length > 0) {
            finalAmountUSD = Math.max(0, finalAmountUSD * (1 - coupon.discount_percent / 100));
            appliedCouponCode = coupon.code;
          }
        }
      }"""
),
])

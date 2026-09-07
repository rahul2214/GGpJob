import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Regression tests for VULN-010 (payment verification did not bind the granted
 * entitlement to the order that was actually paid) and for replay of a genuine
 * payment reference.
 *
 * Threat model: the attacker holds one legitimately paid, correctly signed
 * Razorpay payment for the cheapest product, and tries to
 *   (a) forge a signature,
 *   (b) redeem that payment against a more expensive plan,
 *   (c) redeem it against another account,
 *   (d) redeem an uncaptured payment, or
 *   (e) redeem the same payment repeatedly.
 */

const SECRET = 'test_razorpay_secret';
process.env.RAZORPAY_KEY_SECRET = SECRET;
process.env.RAZORPAY_KEY_ID = 'rzp_test_key';

const ORDER_ID = 'order_TESTORDER001';
const PAYMENT_ID = 'pay_TESTPAYMENT001';

function signature(orderId: string, paymentId: string, secret = SECRET) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

// --- Razorpay gateway stub -------------------------------------------------
const gateway = {
  order: {
    id: ORDER_ID,
    status: 'paid',
    notes: { planId: 'mini', userId: '00000000-0000-4000-8000-000000000001' },
  } as any,
  payment: { id: PAYMENT_ID, order_id: ORDER_ID, status: 'captured' } as any,
};

vi.mock('razorpay', () => ({
  default: class {
    orders = { fetch: vi.fn(async () => gateway.order), create: vi.fn(async () => gateway.order) };
    payments = { fetch: vi.fn(async () => gateway.payment) };
  },
}));

// --- Supabase stub ---------------------------------------------------------
const db = { existingPayment: null as any, updates: [] as string[] };

function builder(table: string) {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    or: () => chain,
    in: () => chain,
    lt: () => chain,
    gt: () => chain,
    neq: () => chain,
    insert: () => {
      db.updates.push(`insert:${table}`);
      return chain;
    },
    update: () => {
      db.updates.push(`update:${table}`);
      return chain;
    },
    maybeSingle: async () => ({
      data: table === 'payments' ? db.existingPayment : null,
      error: null,
    }),
    single: async () => ({ data: null, error: null }),
    then: undefined,
  };
  return chain;
}

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: (table: string) => builder(table),
    rpc: async () => ({ error: null }),
  },
  getSupabaseAdmin: () => ({ from: (t: string) => builder(t) }),
}));

vi.mock('@/lib/plan-prices-service', () => ({
  getPlanPrices: async () => ({ mini: 5, pro: 199, premium: 99, basic: 29 }),
}));

vi.mock('@/lib/exchange-rate-service', () => ({
  getExchangeRates: async () => ({ USD: 1, INR: 83 }),
  convertUSD: (usd: number, cur: string, rates: Record<string, number>) => usd * (rates[cur] || 1),
}));

vi.mock('@/lib/auth-server', () => ({
  requireAuth: vi.fn(async () => ({
    user: {
      id: 1,
      uuid: '00000000-0000-4000-8000-000000000001',
      email: 'seeker@example.test',
      role: 'Job Seeker',
      table: 'jobseekers',
    },
  })),
  isOwnerOrAdmin: vi.fn(() => true),
}));

async function verify(body: Record<string, unknown>) {
  const { POST } = await import('@/app/api/payments/verify/route');
  return POST(
    new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
}

const validBody = (overrides: Record<string, unknown> = {}) => ({
  razorpay_order_id: ORDER_ID,
  razorpay_payment_id: PAYMENT_ID,
  razorpay_signature: signature(ORDER_ID, PAYMENT_ID),
  userId: '00000000-0000-4000-8000-000000000001',
  planId: 'mini',
  currency: 'INR',
  ...overrides,
});

describe('Payment verification integrity', () => {
  beforeEach(() => {
    db.existingPayment = null;
    db.updates = [];
    gateway.order = {
      id: ORDER_ID,
      status: 'paid',
      notes: { planId: 'mini', userId: '00000000-0000-4000-8000-000000000001' },
    };
    gateway.payment = { id: PAYMENT_ID, order_id: ORDER_ID, status: 'captured' };
  });

  it('rejects a forged signature', async () => {
    const res = await verify(validBody({ razorpay_signature: 'deadbeef'.repeat(8) }));
    expect(res.status).toBe(400);
    expect(db.updates).toEqual([]);
  });

  it('rejects a signature made with the wrong secret', async () => {
    const res = await verify(
      validBody({ razorpay_signature: signature(ORDER_ID, PAYMENT_ID, 'attacker_secret') }),
    );
    expect(res.status).toBe(400);
    expect(db.updates).toEqual([]);
  });

  it('refuses to grant a plan the order was not paid for', async () => {
    // Genuine, correctly signed payment for "mini", redeemed against "pro".
    const res = await verify(validBody({ planId: 'pro' }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/does not match the plan that was paid/i);
    expect(db.updates).toEqual([]);
  });

  it('refuses a payment that belongs to a different account', async () => {
    gateway.order.notes.userId = '00000000-0000-4000-8000-0000000000ff';
    const res = await verify(validBody());
    expect(res.status).toBe(403);
    expect(db.updates).toEqual([]);
  });

  it('refuses a payment that was never captured', async () => {
    gateway.payment.status = 'failed';
    const res = await verify(validBody());
    expect(res.status).toBe(400);
    expect(db.updates).toEqual([]);
  });

  it('refuses a payment that belongs to a different order', async () => {
    gateway.payment.order_id = 'order_SOMETHINGELSE';
    const res = await verify(validBody());
    expect(res.status).toBe(400);
    expect(db.updates).toEqual([]);
  });

  it('does not grant entitlement twice for a replayed payment', async () => {
    db.existingPayment = { id: 99 };
    const res = await verify(validBody());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.duplicate).toBe(true);
    // Crucially, no plan update and no credit top-up were performed.
    expect(db.updates).toEqual([]);
  });
});

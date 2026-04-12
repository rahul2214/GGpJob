import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdmin } from '@/lib/check-admin';

// Maps Supabase snake_case fields to camelCase for the frontend
function mapCoupon(c: any) {
    return {
        id:              c.id,
        code:            c.code,
        discountPercent: c.discount_percent,
        expiresAt:       c.expires_at,
        maxUses:         c.max_uses,
        currentUses:     c.current_uses,
        applicablePlan:  c.applicable_plan,
        isActive:        c.is_active,
        createdAt:       c.created_at,
    };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await checkAdmin(userId))) {
        return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { data: coupons, error } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json((coupons ?? []).map(mapCoupon));
  } catch (error: any) {
    console.error('[GET_COUPONS] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons.', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, code, discountPercent, expiresAt, maxUses, applicablePlan } = data;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await checkAdmin(userId))) {
        return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    if (!code || discountPercent === undefined || !expiresAt || maxUses === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const formattedCode = code.toUpperCase().trim();

    // Check if code already exists
    const { data: existing, error: checkError } = await supabaseAdmin
        .from('coupons')
        .select('id')
        .eq('code', formattedCode)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const newCoupon = {
      code: formattedCode,
      discount_percent: Number(discountPercent),
      expires_at: new Date(expiresAt).toISOString(),
      max_uses: Number(maxUses),
      current_uses: 0,
      applicable_plan: applicablePlan || 'all',
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data: createdCoupon, error: insertError } = await supabaseAdmin
        .from('coupons')
        .insert([newCoupon])
        .select()
        .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, ...mapCoupon(createdCoupon) });
  } catch (error: any) {
    console.error('[POST_COUPON] Error:', error);
    return NextResponse.json({ error: 'Failed to create coupon', details: error.message }, { status: 500 });
  }
}

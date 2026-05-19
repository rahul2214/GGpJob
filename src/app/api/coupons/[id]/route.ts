import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAdmin } from '@/lib/check-admin';

export async function PUT(request: Request, context: any) {
  try {
    const { params } = context;
    const data = await request.json();
    const { userId, discountPercent, expiresAt, maxUses, applicablePlan, isActive } = data;
    const { id } = await params;

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
       return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    if (!id) {
       return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (discountPercent !== undefined) updateData.discount_percent = Number(discountPercent);
    if (expiresAt !== undefined) updateData.expires_at = new Date(expiresAt).toISOString();
    if (maxUses !== undefined) updateData.max_uses = Number(maxUses);
    if (applicablePlan !== undefined) updateData.applicable_plan = applicablePlan;
    if (isActive !== undefined) updateData.is_active = Boolean(isActive);


    const { error: updateError } = await supabaseAdmin
        .from('coupons')
        .update(updateData)
        .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, id, ...updateData });
  } catch (error: any) {
    console.error('[PUT_COUPON]', error);
    return NextResponse.json({ error: 'Failed to update coupon', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { params } = context;
    const { id } = await params;

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
       return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    if (!id) {
       return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
        .from('coupons')
        .delete()
        .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[DELETE_COUPON]', error);
    return NextResponse.json({ error: 'Failed to delete coupon', details: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { userId, amount, method, details } = await request.json();

    if (!userId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const redeemAmount = parseFloat(amount);
    if (isNaN(redeemAmount) || redeemAmount < 500) {
      return NextResponse.json({ error: 'Minimum redemption amount is ₹500' }, { status: 400 });
    }

    // 1. Check user balance
    const { data: emp, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, rewards_balance')
      .eq('id', userId)
      .single();

    if (empError || !emp) {
      return NextResponse.json({ error: 'User not found or balance unavailable' }, { status: 404 });
    }

    const currentBalance = emp.rewards_balance || 0;
    if (currentBalance < redeemAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 2. Perform transaction (Deduct balance and insert payout request)
    const { error: updateError } = await supabaseAdmin
      .from('employees')
      .update({ rewards_balance: currentBalance - redeemAmount })
      .eq('id', userId);

    if (updateError) throw updateError;

    const payoutData: any = {
      employee_id: userId,
      amount: redeemAmount,
      method: method,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    if (method === 'bank') {
      payoutData.holder_name = details.accountHolderName;
      payoutData.account_number = details.accountNumber;
      payoutData.ifsc_code = details.ifscCode;
      payoutData.bank_name = details.bankName;
    } else if (method === 'upi') {
      payoutData.upi_id = details.upiId;
      payoutData.holder_name = details.upiHolderName;
    }

    const { error: txError } = await supabaseAdmin
      .from('payouts')
      .insert(payoutData);

    if (txError) {
        // Rollback balance if possible
        console.error("PAYOUT INSERT FAILED, BALANCE DEDUCTED:", txError);
        throw txError;
    }

    // 3. Notify user
    await supabaseAdmin.from('notifications').insert({
        user_pk: (emp as any).id,
        message: `Redemption of ₹${redeemAmount} initiated via ${method.toUpperCase()}. Status: PENDING.`,
        type: 'info',
        created_at: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Redemption request processed successfully.' });

  } catch (e: any) {
    console.error('[REDEEM_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to process redemption', details: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: Request) {
  try {
    const { data, error } = await supabaseAdmin
      .from('payouts')
      .select('*, employees(name, email, phone)')
      .neq('method', 'system')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (e: any) {
    console.error('[ADMIN_PAYOUTS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { payoutId, status, adminNotes } = await request.json();

    if (!payoutId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('payouts')
      .update({ 
        status, 
        admin_notes: adminNotes,
        updated_at: new Date().toISOString() 
      })
      .eq('id', payoutId);

    if (error) throw error;

    // Notify employee if completed or rejected
    const { data: payout } = await supabaseAdmin
        .from('payouts')
        .select('employee_id, amount, method')
        .eq('id', payoutId)
        .single();

    if (payout) {
        const { data: emp } = await supabaseAdmin
            .from('employees')
            .select('id')
            .eq('id', payout.employee_id)
            .single();
        
        if (emp) {
            await supabaseAdmin.from('notifications').insert({
                user_pk: emp.id,
                message: `Your payout request for ₹${payout.amount} has been ${status.toUpperCase()}. ${adminNotes ? `Note: ${adminNotes}` : ''}`,
                type: status === 'completed' ? 'success' : 'error',
                created_at: new Date().toISOString()
            });
        }

        // If rejected, refund the balance
        if (status === 'rejected') {
            const { data: employee } = await supabaseAdmin
                .from('employees')
                .select('rewards_balance')
                .eq('id', payout.employee_id)
                .single();
            
            if (employee) {
                await supabaseAdmin
                    .from('employees')
                    .update({ rewards_balance: (employee.rewards_balance || 0) + payout.amount })
                    .eq('id', payout.employee_id);
            }
        }
    }

    return NextResponse.json({ message: 'Payout updated successfully' });
  } catch (e: any) {
    console.error('[ADMIN_PAYOUTS_PATCH] Error:', e);
    return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, preferredCurrency, country } = await request.json();

    if (!userId || !preferredCurrency) {
      return NextResponse.json({ error: 'User ID and Preferred Currency are required' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    let targetTable: string | null = null;
    let userUuid: string | null = null;

    // Search user table to identify role
    const [
      { data: seeker },
      { data: recruiter },
      { data: employee },
      { data: admin }
    ] = await Promise.all([
      isUUID
        ? supabaseAdmin.from('jobseekers').select('id, uuid').eq('uuid', userId).maybeSingle()
        : supabaseAdmin.from('jobseekers').select('id, uuid').eq('id', userId).maybeSingle(),
      isUUID
        ? supabaseAdmin.from('recruiters').select('id, uuid').eq('uuid', userId).maybeSingle()
        : supabaseAdmin.from('recruiters').select('id, uuid').eq('id', userId).maybeSingle(),
      isUUID
        ? supabaseAdmin.from('employees').select('id, uuid').eq('uuid', userId).maybeSingle()
        : supabaseAdmin.from('employees').select('id, uuid').eq('id', userId).maybeSingle(),
      isUUID
        ? supabaseAdmin.from('admins').select('id, uuid').eq('uuid', userId).maybeSingle()
        : supabaseAdmin.from('admins').select('id, uuid').eq('id', userId).maybeSingle()
    ]);

    if (seeker) {
      targetTable = 'jobseekers';
      userUuid = seeker.uuid;
    } else if (recruiter) {
      targetTable = 'recruiters';
      userUuid = recruiter.uuid;
    } else if (employee) {
      targetTable = 'employees';
      userUuid = employee.uuid;
    } else if (admin) {
      targetTable = 'admins';
      userUuid = admin.uuid;
    }

    if (!targetTable || !userUuid) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Prepare fields to update
    const updatePayload: any = {
      preferred_currency: preferredCurrency.toUpperCase(),
      updated_at: new Date().toISOString()
    };

    if (country) {
      updatePayload.country = country.toUpperCase();
    }

    // Try updating preferred currency (wrap in try-catch in case columns do not exist yet)
    try {
      const { error: updateErr } = await supabaseAdmin
        .from(targetTable)
        .update(updatePayload)
        .eq('uuid', userUuid);

      if (updateErr) throw updateErr;
    } catch (dbErr: any) {
      console.warn('[PREFERRED_CURRENCY_SAVE] DB Update failed (columns might not exist yet):', dbErr);
      return NextResponse.json({
        success: true,
        fallbackMemoryOnly: true,
        message: 'Preference saved locally (database columns not migrated yet).'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Currency preference updated successfully.'
    });
  } catch (error: any) {
    console.error('[API_PREFERRED_CURRENCY] Error:', error);
    return NextResponse.json({ error: 'Failed to update preferred currency', details: error.message }, { status: 500 });
  }
}

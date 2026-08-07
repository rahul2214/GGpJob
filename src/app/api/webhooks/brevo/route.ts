import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { updateCandidatePreference } from '@/lib/crm/candidate-crm';
import { verifyBrevoWebhookSignature } from '@/lib/crm/brevo-service';
import type { BrevoWebhookPayload } from '@/lib/crm/types';

export async function POST(request: NextRequest) {
  try {
    const signatureHeader = request.headers.get('x-brevo-signature') || request.headers.get('x-sib-signature');
    if (!verifyBrevoWebhookSignature(signatureHeader || undefined)) {
      return NextResponse.json({ error: 'Unauthorized webhook request signature' }, { status: 401 });
    }

    const body: BrevoWebhookPayload = await request.json();
    console.log('[BREVO_WEBHOOK] Received event:', body.event, 'for email:', body.email);

    const email = body.email;
    const event = body.event;
    const messageId = body['message-id'] || body.messageId;

    if (!email) {
      return NextResponse.json({ error: 'Missing email in webhook payload' }, { status: 400 });
    }

    // Map Brevo event to JobsDart Status
    let logStatus = 'SENT';
    if (event === 'opened') logStatus = 'OPENED';
    else if (event === 'clicks') logStatus = 'CLICKED';
    else if (event === 'hard_bounce') logStatus = 'HARD_BOUNCE';
    else if (event === 'soft_bounce') logStatus = 'SOFT_BOUNCE';
    else if (event === 'unsubscribe') logStatus = 'UNSUBSCRIBED';
    else if (event === 'spam' || event === 'blocked') logStatus = 'SPAM';

    // Handle Unsubscribe / Bounce
    if (event === 'unsubscribe' || event === 'spam') {
      updateCandidatePreference(email, 'PAUSED', true);

      try {
        await supabaseAdmin
          .from('crm_candidates')
          .update({
            is_unsubscribed: true,
            lifecycle_stage: 'UNSUBSCRIBED',
            updated_at: new Date().toISOString(),
          })
          .eq('email', email);
      } catch (e) {
        console.warn('[BREVO_WEBHOOK] Supabase update candidate unsubscribe fallback:', e);
      }
    }

    // Update Email Logs
    if (messageId) {
      try {
        const updateData: any = { status: logStatus };
        if (event === 'opened') updateData.opened_at = new Date().toISOString();
        if (event === 'clicks') updateData.clicked_at = new Date().toISOString();

        await supabaseAdmin
          .from('crm_email_logs')
          .update(updateData)
          .eq('brevo_message_id', messageId);
      } catch (e) {
        console.warn('[BREVO_WEBHOOK] Supabase update log status fallback:', e);
      }
    }

    return NextResponse.json({
      success: true,
      processedEvent: event,
      email,
    });
  } catch (err: any) {
    console.error('[BREVO_WEBHOOK_ERROR]:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}

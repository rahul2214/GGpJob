import { NextResponse, NextRequest } from 'next/server';
import { getCRMCandidates, syncBatchCandidatesToBrevo } from '@/lib/crm/candidate-crm';

export async function POST(request: NextRequest) {
  try {
    const candidates = await getCRMCandidates();
    const result = await syncBatchCandidatesToBrevo(candidates);

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${result.synced} of ${result.total} candidate contacts to Brevo CRM.`,
      result,
    });
  } catch (err: any) {
    console.error('[API_CRM_SYNC] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to sync contacts to Brevo' }, { status: 500 });
  }
}

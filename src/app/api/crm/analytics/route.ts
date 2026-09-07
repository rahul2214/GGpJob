import { NextResponse, NextRequest } from 'next/server';
import { getCRMCandidates, getCRMEmailLogs } from '@/lib/crm/candidate-crm';
import { computeCRMAnalytics } from '@/lib/crm/analytics-engine';
import { getQueueStatus } from '@/lib/crm/queue-processor';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const [candidates, logs, summary] = await Promise.all([
      getCRMCandidates(),
      getCRMEmailLogs(),
      computeCRMAnalytics(),
    ]);

    const queue = getQueueStatus();

    return NextResponse.json({
      summary,
      candidates,
      logs,
      queue,
    });
  } catch (err: any) {
    console.error('[API_CRM_ANALYTICS] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch CRM analytics' }, { status: 500 });
  }
}

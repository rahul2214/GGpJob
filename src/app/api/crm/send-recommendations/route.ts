import { NextResponse, NextRequest } from 'next/server';
import { getCRMCandidates, runAIRecommendationForCandidate } from '@/lib/crm/candidate-crm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const targetCandidateId = body.candidateId;
    const targetEmail = body.email;

    const candidates = await getCRMCandidates();
    let targetList = candidates;

    if (targetCandidateId) {
      targetList = candidates.filter(c => String(c.id) === String(targetCandidateId));
    } else if (targetEmail) {
      targetList = candidates.filter(c => c.email.toLowerCase() === targetEmail.toLowerCase());
    }

    if (targetList.length === 0) {
      return NextResponse.json({ error: 'No matching candidate profiles found for email recommendation' }, { status: 404 });
    }

    const isTargeted = !!targetCandidateId || !!targetEmail;

    const results = [];
    for (const candidate of targetList) {
      const res = await runAIRecommendationForCandidate(candidate, { forceSend: isTargeted });
      results.push({
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        ...res,
      });
    }

    const successfulCount = results.filter(r => r.success).length;

    if (isTargeted && successfulCount === 0 && results.length > 0) {
      return NextResponse.json({
        error: results[0].reason || 'Failed to send recommendation email to candidate.',
        results,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `AI Job Recommendation Campaign completed for ${results.length} candidate(s) (${successfulCount} dispatched via Brevo).`,
      results,
    });
  } catch (err: any) {
    console.error('[API_CRM_SEND_RECOMMENDATIONS] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to dispatch AI job recommendations' }, { status: 500 });
  }
}

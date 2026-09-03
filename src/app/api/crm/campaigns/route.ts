import { NextResponse, NextRequest } from 'next/server';
import { getCRMCandidates, filterCandidatesByCampaignType, getRecentJobsHtml, getRecommendedJobsHtml } from '@/lib/crm/candidate-crm';
import { CAMPAIGN_STRUCTURE_CATALOG, renderCRMTemplate } from '@/lib/crm/template-engine';
import { enqueueTask } from '@/lib/crm/queue-processor';
import { sendBrevoTransactionalEmail } from '@/lib/crm/brevo-service';
import type { CampaignType } from '@/lib/crm/types';

export async function GET() {
  return NextResponse.json({
    campaigns: CAMPAIGN_STRUCTURE_CATALOG,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const campaignType: CampaignType = body.campaignType || 'JOB_RECOMMENDATIONS';
    const targetCandidateId = body.candidateId;
    const templateId = body.templateId;

    const allCandidates = await getCRMCandidates();
    let targetList = filterCandidatesByCampaignType(allCandidates, campaignType);

    if (targetCandidateId) {
      targetList = allCandidates.filter((c) => String(c.id) === String(targetCandidateId));
    }

    if (targetList.length === 0) {
      return NextResponse.json(
        { error: `No eligible candidates found for ${campaignType} campaign segmentation.` },
        { status: 404 }
      );
    }

    const results = [];
    const resolvedTemplateId = templateId || CAMPAIGN_STRUCTURE_CATALOG.find((c) => c.type === campaignType)?.defaultTemplateId || `tpl_${campaignType.toLowerCase()}`;

    for (const candidate of targetList) {
      let jobsHtml = '';
      if (campaignType === 'RECENT_JOBS_DIGEST' || resolvedTemplateId === 'tpl_recent_jobs') {
        const recentJobsData = await getRecentJobsHtml(candidate, request.nextUrl.origin, 5);
        jobsHtml = recentJobsData.jobsHtml;
      } else if (campaignType === 'JOB_RECOMMENDATIONS' || campaignType === 'AI_JOB_RECOMMENDATION' || resolvedTemplateId === 'tpl_job_recommendations') {
        const recData = await getRecommendedJobsHtml(candidate, request.nextUrl.origin, 5);
        jobsHtml = recData.jobsHtml;
      }

      const { subject, htmlContent, tags } = renderCRMTemplate(
        resolvedTemplateId,
        candidate,
        jobsHtml,
        request.nextUrl.origin
      );

      const emailRes = await sendBrevoTransactionalEmail({
        toEmail: candidate.email,
        toName: candidate.name,
        subject,
        htmlContent,
        tags: [...tags, campaignType.toLowerCase()],
      });

      results.push({
        candidateId: candidate.id,
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        success: emailRes.ok,
        messageId: emailRes.messageId,
      });
    }

    enqueueTask('ANALYTICS_RECALCULATION', { campaignType, dispatchedCount: results.length });

    const dispatchedCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      campaignType,
      targetCount: targetList.length,
      dispatchedCount,
      results,
      message: `Successfully executed ${campaignType} campaign for ${targetList.length} candidate(s) (${dispatchedCount} dispatched via Brevo).`,
    });
  } catch (err: any) {
    console.error('[API_CRM_CAMPAIGNS_POST] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to execute campaign' },
      { status: 500 }
    );
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { getCRMCandidates, recordCRMEmailLog } from '@/lib/crm/candidate-crm';
import { renderBlogEmailTemplate } from '@/lib/crm/template-engine';
import { getPostBySlug, getRelatedPosts, getAllPosts } from '@/lib/blog';
import { sendBrevoTransactionalEmail } from '@/lib/crm/brevo-service';
import { enqueueTask } from '@/lib/crm/queue-processor';
import { requireAdmin } from '@/lib/auth-server';
import type { CRMCandidate, CRMEmailLog, LifecycleStage } from '@/lib/crm/types';

export async function POST(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const body = await request.json().catch(() => ({}));
    const {
      slug,
      targetStage = 'ALL',
      testEmail,
      customSubject,
      includeRelated = true,
    } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Blog slug is required' }, { status: 400 });
    }

    const blog = getPostBySlug(slug);
    if (!blog) {
      return NextResponse.json(
        { error: `Blog article not found for slug: ${slug}` },
        { status: 404 }
      );
    }

    // Resolve related articles
    let relatedBlogs: any[] = [];
    if (includeRelated) {
      const directRelated = getRelatedPosts(blog);
      if (directRelated.length > 0) {
        relatedBlogs = directRelated.slice(0, 2);
      } else {
        relatedBlogs = getAllPosts()
          .filter((p) => p.slug !== blog.slug)
          .slice(0, 2);
      }
    }

    // Determine recipients
    let recipients: CRMCandidate[] = [];

    if (testEmail && typeof testEmail === 'string' && testEmail.trim()) {
      recipients = [
        {
          id: `test_${Date.now()}`,
          uuid: `test-uuid-${Date.now()}`,
          name: 'Test Administrator',
          email: testEmail.trim(),
          role: 'Job Seeker',
          preferredJobTitles: ['Software Engineer'],
          lifecycleStage: 'ACTIVE_SEEKER',
          engagementScore: 90,
          skills: ['Software Engineering', 'AI'],
          preferredLocations: ['Remote'],
          brevoSyncStatus: 'SYNCED',
          emailFrequency: 'WEEKLY',
          isUnsubscribed: false,
          totalEmailsSent: 1,
          totalEmailsOpened: 1,
          totalEmailsClicked: 1,
          totalApplicationsSubmitted: 0,
          createdAt: new Date().toISOString(),
        },
      ];
    } else {
      const allCandidates = await getCRMCandidates();
      // Filter out unsubscribed / paused
      const activeCandidates = allCandidates.filter(
        (c) => !c.isUnsubscribed && c.emailFrequency !== 'PAUSED'
      );

      if (targetStage && targetStage !== 'ALL') {
        recipients = activeCandidates.filter((c) => c.lifecycleStage === targetStage);
      } else {
        recipients = activeCandidates;
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: `No candidates found matching target audience: ${targetStage}` },
        { status: 400 }
      );
    }

    const results = [];
    let dispatchedCount = 0;
    let failedCount = 0;

    for (const candidate of recipients) {
      const { subject, htmlContent, tags } = renderBlogEmailTemplate({
        candidate,
        blog,
        relatedBlogs,
        origin: request.nextUrl.origin,
        customSubject,
      });

      const emailRes = await sendBrevoTransactionalEmail({
        toEmail: candidate.email,
        toName: candidate.name,
        subject,
        htmlContent,
        tags,
      });

      const messageId = emailRes.messageId || `msg_blog_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Audit log
      const logEntry: CRMEmailLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        candidateId: candidate.id,
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        campaignType: 'BLOG_SHOWCASE',
        emailSubject: subject,
        brevoMessageId: messageId,
        status: emailRes.ok ? 'DELIVERED' : 'FAILED',
        recommendedJobIds: [],
        recommendedJobTitles: [blog.heading || blog.title],
        matchScoreAverage: 100,
        sentAt: new Date().toISOString(),
        errorMessage: emailRes.error,
      };

      await recordCRMEmailLog(logEntry);

      if (emailRes.ok) {
        dispatchedCount++;
      } else {
        failedCount++;
      }

      results.push({
        candidateEmail: candidate.email,
        candidateName: candidate.name,
        success: emailRes.ok,
        messageId,
        error: emailRes.error,
      });
    }

    // Trigger analytics recalculation in background
    enqueueTask('ANALYTICS_RECALCULATION', {
      campaignType: 'BLOG_SHOWCASE',
      blogSlug: slug,
      dispatchedCount,
    });

    return NextResponse.json({
      success: true,
      blogSlug: slug,
      blogTitle: blog.heading || blog.title,
      targetCount: recipients.length,
      dispatchedCount,
      failedCount,
      isTest: Boolean(testEmail),
      results,
      message: testEmail
        ? `Test blog email successfully sent to ${testEmail}`
        : `Successfully launched blog campaign for "${blog.heading || blog.title}" to ${recipients.length} candidate(s) (${dispatchedCount} delivered via Brevo).`,
    });
  } catch (err: any) {
    console.error('[API_CRM_SEND_BLOG_POST] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch blog campaign' },
      { status: 500 }
    );
  }
}

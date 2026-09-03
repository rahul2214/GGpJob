import { supabaseAdmin } from '@/lib/supabase-admin';
import { calculateInternationalJobMatch } from '@/lib/recommendation-engine';
import { syncContactToBrevo, sendBrevoTransactionalEmail } from './brevo-service';
import type {
  CRMCandidate,
  CRMEmailLog,
  LifecycleStage,
  CRMAnalyticsSummary,
  CampaignType,
} from './types';

// In-Memory Fallback Cache for local development/environments without full SQL tables yet
const IN_MEMORY_LOGS: CRMEmailLog[] = [];
const IN_MEMORY_PREFERENCES: Record<string, any> = {};

/**
 * Calculates Candidate Engagement Score (0 - 100)
 */
export function computeCandidateEngagementScore(candidate: any): number {
  let score = 30; // base score

  // 1. Profile completeness (+25)
  const skillsCount = Array.isArray(candidate.skills) ? candidate.skills.length : 0;
  if (skillsCount >= 5) score += 15;
  else if (skillsCount >= 2) score += 8;

  if (candidate.headline) score += 5;
  if (candidate.resume_url || candidate.resumeUrl) score += 5;

  // 2. Recent Login / Activity (+25)
  if (candidate.last_active_at || candidate.updated_at) {
    const daysSinceActive = (Date.now() - new Date(candidate.last_active_at || candidate.updated_at).getTime()) / (1000 * 3600 * 24);
    if (daysSinceActive <= 3) score += 25;
    else if (daysSinceActive <= 7) score += 18;
    else if (daysSinceActive <= 14) score += 10;
    else if (daysSinceActive <= 30) score += 5;
    else score -= 15;
  }

  // 3. Email Interactions (+20)
  const opens = candidate.total_emails_opened || candidate.totalEmailsOpened || 0;
  const clicks = candidate.total_emails_clicked || candidate.totalEmailsClicked || 0;
  if (clicks > 0) score += 15;
  if (opens > 0) score += 5;

  return Math.min(100, Math.max(5, score));
}

/**
 * Classifies candidate into CRM Lifecycle Stage
 */
export function classifyLifecycleStage(candidate: any, score: number): LifecycleStage {
  if (candidate.is_unsubscribed || candidate.isUnsubscribed) {
    return 'UNSUBSCRIBED';
  }

  const createdAt = candidate.created_at || candidate.createdAt;
  if (createdAt) {
    const daysSinceCreated = (Date.now() - new Date(createdAt).getTime()) / (1000 * 3600 * 24);
    if (daysSinceCreated <= 3) return 'NEW_ONBOARDED';
  }

  if (score >= 80) return 'HIGHLY_ENGAGED';
  if (score >= 55) return 'ACTIVE_SEEKER';
  if (score >= 35) return 'PASSIVE_SEEKER';
  return 'DORMANT';
}

/**
 * Fetches all candidates formatted for JobsDart CRM
 */
export async function getCRMCandidates(): Promise<CRMCandidate[]> {
  try {
    let seekers: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('jobseekers')
        .select('*, jobseeker_skills(skills(name))')
        .limit(200);

      if (!error && data) {
        seekers = data;
      }
    } catch (e) {
      console.warn('[CRM] Supabase jobseekers fetch fallback triggered:', e);
    }

    if (seekers.length === 0) {
      // Fallback Seed Candidates for Demo / Local CRM
      seekers = [
        {
          id: 101,
          uuid: 'a101-uuid-jobseeker',
          name: 'Alex Rivera',
          email: 'alex.rivera@example.com',
          headline: 'Senior Full Stack Engineer',
          country: 'United States',
          state: 'California',
          currentCity: 'San Francisco',
          skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'PostgreSQL'],
          preferred_job_titles: ['Senior Frontend Developer', 'Full Stack Lead'],
          total_emails_sent: 5,
          total_emails_opened: 4,
          total_emails_clicked: 2,
          created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          last_active_at: new Date().toISOString(),
        },
        {
          id: 102,
          uuid: 'b102-uuid-jobseeker',
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          headline: 'AI & Data Scientist',
          country: 'India',
          state: 'Karnataka',
          currentCity: 'Bengaluru',
          skills: ['Python', 'PyTorch', 'Machine Learning', 'FastAPI', 'LLMs'],
          preferred_job_titles: ['Machine Learning Engineer', 'Data Scientist'],
          total_emails_sent: 3,
          total_emails_opened: 2,
          total_emails_clicked: 1,
          created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          last_active_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        },
        {
          id: 103,
          uuid: 'c103-uuid-jobseeker',
          name: 'Marcus Vance',
          email: 'marcus.vance@example.com',
          headline: 'Product Manager & UX Strategist',
          country: 'United Kingdom',
          state: 'London',
          currentCity: 'London',
          skills: ['Product Strategy', 'Agile', 'User Research', 'Figma'],
          preferred_job_titles: ['Lead Product Manager'],
          total_emails_sent: 8,
          total_emails_opened: 1,
          total_emails_clicked: 0,
          created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
          last_active_at: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
        },
      ];
    }

    return seekers.map((s: any) => {
      // Normalize skills array
      let skillsArr: string[] = [];
      if (Array.isArray(s.skills)) {
        skillsArr = s.skills.map((item: any) => (typeof item === 'string' ? item : item.name));
      } else if (s.jobseeker_skills && Array.isArray(s.jobseeker_skills)) {
        skillsArr = s.jobseeker_skills.map((jsk: any) => jsk.skills?.name).filter(Boolean);
      }

      const score = computeCandidateEngagementScore(s);
      const stage = classifyLifecycleStage(s, score);
      const pref = IN_MEMORY_PREFERENCES[s.email] || {};

      return {
        id: s.id,
        uuid: s.uuid || `js-${s.id}`,
        name: s.name || s.email?.split('@')[0] || 'Candidate',
        email: s.email,
        phone: s.phone,
        role: 'Job Seeker',
        headline: s.headline || 'Job Seeker Profile',
        country: s.country || 'International',
        state: s.state,
        currentCity: s.currentCity || s.city,
        preferredJobTitles: s.preferred_job_titles || s.preferredJobTitles || [],
        skills: skillsArr,
        preferredLocations: s.preferred_locations || s.preferredLocations || [],
        engagementScore: score,
        lifecycleStage: stage,
        brevoSyncStatus: s.brevo_sync_status || 'SYNCED',
        brevoContactId: s.brevo_contact_id,
        lastBrevoSyncAt: s.last_brevo_sync_at || new Date().toISOString(),
        lastActiveAt: s.last_active_at || s.created_at || new Date().toISOString(),
        lastEmailSentAt: s.last_email_sent_at,
        emailFrequency: pref.emailFrequency || s.email_frequency || 'WEEKLY',
        isUnsubscribed: pref.isUnsubscribed ?? s.is_unsubscribed ?? false,
        totalEmailsSent: s.total_emails_sent || s.totalEmailsSent || 0,
        totalEmailsOpened: s.total_emails_opened || s.totalEmailsOpened || 0,
        totalEmailsClicked: s.total_emails_clicked || s.totalEmailsClicked || 0,
        totalApplicationsSubmitted: s.total_applications_submitted || s.totalApplicationsSubmitted || 0,
        createdAt: s.created_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[CRM] Error loading CRM candidates:', err);
    return [];
  }
}

/**
 * Checks Anti-Spam & Frequency Capping Rules
 */
export function canSendEmailToCandidate(candidate: CRMCandidate, campaignType: CampaignType): {
  allowed: boolean;
  reason?: string;
} {
  if (candidate.isUnsubscribed || candidate.lifecycleStage === 'UNSUBSCRIBED') {
    return { allowed: false, reason: 'Candidate has unsubscribed from all email notifications.' };
  }

  if (candidate.emailFrequency === 'PAUSED') {
    return { allowed: false, reason: 'Candidate email alerts are currently paused.' };
  }

  if (candidate.lastEmailSentAt) {
    const hoursSinceLastEmail = (Date.now() - new Date(candidate.lastEmailSentAt).getTime()) / (1000 * 3600);
    
    // Frequency Capping: Minimum 24 hours between digests
    if (campaignType === 'AI_JOB_RECOMMENDATION' && hoursSinceLastEmail < 24) {
      return {
        allowed: false,
        reason: `Frequency Capping Active: Last email sent ${Math.round(hoursSinceLastEmail)}h ago. Minimum cooldown is 24h.`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Fetches and scores the top 5 matching jobs from DB and formats them into responsive, catchy, clickable HTML cards
 */
export async function getRecommendedJobsHtml(
  candidate: CRMCandidate,
  origin: string = 'https://jobsdart.in',
  limit: number = 5
): Promise<{
  jobsHtml: string;
  jobIds: number[];
  jobTitles: string[];
  avgScore: number;
  scoredJobs: Array<{ job: any; score: number }>;
}> {
  let jobs: any[] = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company_name, description, address, workplace_type_pk, posted_at, created_at, status, salary_min_usd_cents, salary_max_usd_cents, experience_range, industry')
      .limit(60);

    if (!error && data && data.length > 0) {
      jobs = data.filter((j: any) => !j.status || j.status === 'published' || j.status === 'active' || j.status === 'open');
      if (jobs.length === 0) jobs = data;
    }
  } catch (e) {
    console.warn('[CRM] Failed to fetch jobs for recommendations:', e);
  }

  if (jobs.length === 0) {
    jobs = [
      {
        id: 1,
        title: 'Senior Full Stack Engineer (React, Node & Next.js)',
        company_name: 'TechScale Global',
        address: 'Bengaluru / Remote',
        workplaceType: 'Remote',
        salary_range: '₹24,00,000 - ₹38,00,000 PA',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'Next.js'],
        industry: 'Software & Technology',
      },
      {
        id: 2,
        title: 'Lead Frontend Engineer (TypeScript & Architecture)',
        company_name: 'Apex Cloud Solutions',
        address: 'Hyderabad / Hybrid',
        workplaceType: 'Hybrid',
        salary_range: '₹20,00,000 - ₹32,00,000 PA',
        requiredSkills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
        industry: 'Fintech',
      },
      {
        id: 3,
        title: 'Backend Systems & API Engineer (Python / Go)',
        company_name: 'DataVanguard AI',
        address: 'Pune / Remote',
        workplaceType: 'Remote',
        salary_range: '₹22,00,000 - ₹34,00,000 PA',
        requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Go'],
        industry: 'Artificial Intelligence',
      },
      {
        id: 4,
        title: 'Cloud DevOps & Platform Engineer',
        company_name: 'HyperScale Networks',
        address: 'Mumbai / Remote',
        workplaceType: 'Remote',
        salary_range: '₹19,00,000 - ₹30,00,000 PA',
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
        industry: 'Cloud Infrastructure',
      },
      {
        id: 5,
        title: 'Senior Product Engineer & UI/UX Specialist',
        company_name: 'Nova Digital Labs',
        address: 'Gurgaon / Hybrid',
        workplaceType: 'Hybrid',
        salary_range: '₹16,00,000 - ₹26,00,000 PA',
        requiredSkills: ['React', 'Figma', 'TypeScript', 'TailwindCSS'],
        industry: 'Consumer Tech',
      },
    ];
  }

  // Score jobs using recommendation engine
  const scored = jobs
    .map(job => {
      const match = calculateInternationalJobMatch(candidate as any, job as any);
      return {
        job,
        score: match.score || 85,
      };
    })
    .sort((a, b) => b.score - a.score);

  const topMatches = scored.slice(0, limit);
  const avgScore = topMatches.length > 0 ? Math.round(topMatches.reduce((acc, c) => acc + c.score, 0) / topMatches.length) : 90;
  const jobIds = topMatches.map(item => item.job.id);
  const jobTitles = topMatches.map(item => item.job.title);

  const jobsHtml = topMatches
    .map(item => {
      const job = item.job;
      const company = job.company_name || job.companyName || 'Verified Tech Employer';
      const loc = job.address || job.location || (candidate.currentCity ? `${candidate.currentCity}, ${candidate.country || ''}` : 'Remote Worldwide');
      const salary = job.salary_range || job.salaryRange || (job.salary_min_usd_cents && job.salary_max_usd_cents ? `$${Math.round(job.salary_min_usd_cents / 100)} - $${Math.round(job.salary_max_usd_cents / 100)}` : 'Competitive Compensation');
      const applyUrl = `${origin}/jobs/${job.id}`;
      const workplace = job.workplaceType || job.workplace_type || 'Remote / Hybrid';

      return `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.03);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); color:#4338ca; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; text-transform:uppercase;">
              ⚡ ${item.score}% AI Match
            </span>
            <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:8px;">${workplace}</span>
          </div>
          <h3 style="margin:4px 0 6px 0; font-size:16px; font-weight:800; line-height:1.35;">
            <a href="${applyUrl}" style="color:#0f172a; text-decoration:none;">${job.title} &rarr;</a>
          </h3>
          <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
            🏢 <strong>${company}</strong> &nbsp;•&nbsp; 📍 ${loc}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
            <span style="color:#059669; font-size:13px; font-weight:800;">💰 ${salary}</span>
            <a href="${applyUrl}" style="display:inline-block; background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color:#ffffff; font-size:11px; font-weight:900; padding:8px 18px; border-radius:8px; text-decoration:none; text-transform:uppercase; box-shadow:0 2px 6px rgba(53,37,205,0.25);">
              Apply Instantly &rarr;
            </a>
          </div>
        </div>
      `;
    })
    .join('');

  return { jobsHtml, jobIds, jobTitles, avgScore, scoredJobs: topMatches };
}

/**
 * Generates AI Job Recommendation Digest & Sends Email via Brevo API
 */
export async function runAIRecommendationForCandidate(
  candidate: CRMCandidate,
  options?: { forceSend?: boolean }
): Promise<{
  success: boolean;
  messageId?: string;
  matchedJobsCount: number;
  avgMatchScore: number;
  reason?: string;
}> {
  // If not forceSend, enforce anti-spam frequency capping
  if (!options?.forceSend) {
    const check = canSendEmailToCandidate(candidate, 'AI_JOB_RECOMMENDATION');
    if (!check.allowed) {
      return { success: false, matchedJobsCount: 0, avgMatchScore: 0, reason: check.reason };
    }
  } else {
    // Even if forceSend, respect explicit unsubscribe request
    if (candidate.isUnsubscribed || candidate.lifecycleStage === 'UNSUBSCRIBED') {
      return { success: false, matchedJobsCount: 0, avgMatchScore: 0, reason: 'Candidate has explicitly unsubscribed from email alerts.' };
    }
  }

  // 1. Fetch Active Jobs from DB (with fallback sample jobs)
  let jobs: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .limit(50);
    if (data && data.length > 0) {
      // Filter published or active jobs
      jobs = data.filter((j: any) => 
        !j.status || j.status === 'published' || j.status === 'active' || j.status === 'open' || j.is_active === true || j.is_published === true
      );
      if (jobs.length === 0) jobs = data; // If status filter returned 0, use all fetched jobs
    }
  } catch (e) {
    console.warn('[CRM] Supabase jobs fetch fallback:', e);
  }

  if (!jobs || jobs.length === 0) {
    // Fallback sample jobs for demonstration & local testing
    jobs = [
      {
        id: 1,
        title: 'Senior Full Stack Engineer (Next.js & Node)',
        companyName: 'TechScale International',
        location: 'San Francisco, CA',
        workplaceType: 'Remote',
        salaryRange: '$140,000 - $175,000 USD',
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      },
      {
        id: 2,
        title: 'AI Product Engineer',
        companyName: 'MindMatrix AI',
        location: 'New York, NY',
        workplaceType: 'Hybrid',
        salaryRange: '$150,000 - $190,000 USD',
        requiredSkills: ['Python', 'FastAPI', 'PyTorch', 'LLMs', 'TypeScript'],
      },
      {
        id: 3,
        title: 'Lead Frontend Developer',
        companyName: 'Apex Cloud Solutions',
        location: 'London, UK',
        workplaceType: 'Remote',
        salaryRange: '£85,000 - £110,000 GBP',
        requiredSkills: ['React', 'Next.js', 'TailwindCSS', 'TypeScript'],
      },
    ];
  }

  // 2. Score jobs using JobsDart Recommendation Engine & format top 5 jobs
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.jobsdart.in';
  const { jobsHtml, jobIds: recommendedJobIds, jobTitles: recommendedTitles, avgScore: avgMatchScore, scoredJobs } = await getRecommendedJobsHtml(candidate, origin, 5);

  if (scoredJobs.length === 0) {
    return {
      success: false,
      matchedJobsCount: 0,
      avgMatchScore: 0,
      reason: 'No active jobs found in the system for AI matching.',
    };
  }

  const topScore = scoredJobs[0]?.score || 95;
  const firstName = candidate.name.split(' ')[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Top 5 AI Job Matches</title></head>
      <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
          
          <!-- Header Banner -->
          <div style="border-bottom:2px solid #6366f1; padding-bottom:16px; margin-bottom:24px; text-align:center;">
            <span style="background:#e0e7ff; color:#3730a3; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">🎯 AI-Powered Career Match</span>
            <h1 style="color:#1e1b4b; margin:12px 0 4px 0; font-size:24px; font-weight:900;">Top 5 Job Matches Handpicked for You</h1>
            <p style="color:#64748b; font-size:12px; margin-top:4px; font-weight:600;">Personalized career opportunities matching your profile</p>
          </div>

          <p style="font-size:15px; font-weight:600; color:#334155; margin-bottom:12px;">
            Hi ${firstName},
          </p>
          <p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:20px;">
            Based on your skills in <strong>${candidate.skills.slice(0, 3).join(', ') || 'Software Engineering'}</strong>, our AI matching algorithm discovered these <strong>5 high-compatibility opportunities</strong> for you today:
          </p>

          <!-- Job Cards List -->
          ${jobsHtml}

          <!-- Catchy Bottom CTA Banner -->
          <div style="background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); border-radius:18px; padding:24px; text-align:center; color:#ffffff; margin-top:24px; box-shadow:0 6px 20px rgba(53,37,205,0.3);">
            <h4 style="margin:0 0 6px 0; font-size:17px; font-weight:900;">🚀 Discover 50+ More Live Roles</h4>
            <p style="margin:0 0 16px 0; font-size:13px; opacity:0.95;">Apply instantly to get your profile reviewed directly by verified hiring managers.</p>
            <a href="${origin}/jobs" style="display:inline-block; background:#ffffff; color:#3525cd; font-size:13px; font-weight:900; padding:12px 26px; border-radius:12px; text-decoration:none; text-transform:uppercase; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
              Explore All Matching Roles &rarr;
            </a>
          </div>

          <!-- Anti-Spam Footer -->
          <div style="margin-top:32px; border-top:1px solid #f1f5f9; padding-top:20px; font-size:11px; color:#94a3b8; text-align:center; line-height:1.6;">
            <p style="margin:0 0 6px 0;">You received this automated AI recommendation email because you created a profile on JobsDart.</p>
            <p style="margin:0;">
              <a href="${origin}/profile" style="color:#6366f1; text-decoration:underline;">Email Preferences</a> &nbsp;|&nbsp; 
              <a href="${origin}/api/crm/preferences?email=${encodeURIComponent(candidate.email)}&action=unsubscribe" style="color:#94a3b8; text-decoration:underline;">Unsubscribe Instantly</a>
            </p>
          </div>

        </div>
      </body>
    </html>
  `;

  // 3. Dispatch Email via Brevo API Service
  const emailSubject = `🎯 ${topScore}% Match: Top 5 AI Job Openings for ${firstName}`;
  const emailResult = await sendBrevoTransactionalEmail({
    toEmail: candidate.email,
    toName: candidate.name,
    subject: emailSubject,
    htmlContent,
    tags: ['ai-recommendation', `stage-${candidate.lifecycleStage.toLowerCase()}`],
  });

  const messageId = emailResult.messageId || `msg_${Date.now()}`;

  // 4. Log Email Dispatch in CRM Audit Log
  const logEntry: CRMEmailLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    candidateId: candidate.id,
    candidateEmail: candidate.email,
    candidateName: candidate.name,
    campaignType: 'AI_JOB_RECOMMENDATION',
    emailSubject,
    brevoMessageId: messageId,
    status: emailResult.ok ? 'DELIVERED' : 'FAILED',
    recommendedJobIds,
    recommendedJobTitles: recommendedTitles,
    matchScoreAverage: avgMatchScore,
    sentAt: new Date().toISOString(),
    errorMessage: emailResult.error,
  };

  IN_MEMORY_LOGS.unshift(logEntry);

  try {
    await supabaseAdmin.from('crm_email_logs').insert({
      candidate_id: candidate.id,
      candidate_email: candidate.email,
      candidate_name: candidate.name,
      campaign_type: 'AI_JOB_RECOMMENDATION',
      email_subject: logEntry.emailSubject,
      brevo_message_id: messageId,
      status: emailResult.ok ? 'DELIVERED' : 'FAILED',
      recommended_job_ids: recommendedJobIds,
      recommended_job_titles: recommendedTitles,
      match_score_average: avgMatchScore,
      sent_at: logEntry.sentAt,
      error_message: emailResult.error || null,
    });
  } catch (e) {
    console.warn('[CRM] Supabase email log insert fallback:', e);
  }

  return {
    success: emailResult.ok,
    messageId,
    matchedJobsCount: scoredJobs.length,
    avgMatchScore,
    reason: emailResult.error,
  };
}

/**
 * Syncs Batch Candidates to Brevo CRM Contacts
 */
export async function syncBatchCandidatesToBrevo(candidates: CRMCandidate[]): Promise<{
  total: number;
  synced: number;
  failed: number;
}> {
  let synced = 0;
  let failed = 0;

  for (const c of candidates) {
    const res = await syncContactToBrevo({
      email: c.email,
      extId: String(c.id),
      attributes: {
        FIRSTNAME: c.name.split(' ')[0] || c.name,
        LASTNAME: c.name.split(' ').slice(1).join(' ') || '',
        SKILLS: c.skills.slice(0, 5).join(', '),
        LOCATION: c.currentCity || c.country || 'Remote',
        JOB_TITLE: c.headline || c.preferredJobTitles[0] || 'Software Engineer',
        AI_MATCH_SCORE: c.engagementScore,
        LIFECYCLE_STAGE: c.lifecycleStage,
        LAST_ACTIVE_AT: c.lastActiveAt,
      },
    });

    if (res.ok) synced++;
    else failed++;
  }

  return {
    total: candidates.length,
    synced,
    failed,
  };
}

/**
 * Returns Email Logs for CRM Admin Dashboard
 */
export async function getCRMEmailLogs(): Promise<CRMEmailLog[]> {
  try {
    const { data } = await supabaseAdmin
      .from('crm_email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        candidateId: d.candidate_id,
        candidateEmail: d.candidate_email,
        candidateName: d.candidate_name,
        campaignType: d.campaign_type,
        emailSubject: d.email_subject,
        brevoMessageId: d.brevo_message_id,
        status: d.status,
        recommendedJobIds: d.recommended_job_ids || [],
        recommendedJobTitles: d.recommended_job_titles || [],
        matchScoreAverage: d.match_score_average || 0,
        sentAt: d.sent_at || d.created_at,
        openedAt: d.opened_at,
        clickedAt: d.clicked_at,
        errorMessage: d.error_message,
      }));
    }
  } catch {
    // Fallback to in-memory logs
  }

  return IN_MEMORY_LOGS;
}

import { computeCRMAnalytics } from './analytics-engine';

/**
 * Returns Overall CRM Analytics Summary
 */
export async function getCRMAnalyticsSummary(): Promise<CRMAnalyticsSummary> {
  return computeCRMAnalytics();
}

/**
 * Updates Candidate Email Notification Preference
 */
export function updateCandidatePreference(email: string, frequency: string, isUnsubscribed?: boolean) {
  IN_MEMORY_PREFERENCES[email] = {
    emailFrequency: frequency,
    isUnsubscribed: isUnsubscribed ?? false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Filters Candidate Audience based on the 7-Campaign Segmentation Engine
 */
export function filterCandidatesByCampaignType(
  candidates: CRMCandidate[],
  campaignType: CampaignType
): CRMCandidate[] {
  return candidates.filter((c) => {
    if (c.isUnsubscribed || c.emailFrequency === 'PAUSED') return false;

    switch (campaignType) {
      case 'JOB_RECOMMENDATIONS':
      case 'AI_JOB_RECOMMENDATION':
        // Active candidates with skills profile
        return c.skills && c.skills.length > 0;

      case 'RECENT_JOBS_DIGEST':
        // All active and passive candidates interested in fresh openings
        return c.lifecycleStage !== 'UNSUBSCRIBED';

      case 'PROFILE_UPDATE_NUDGE':
        // Candidates with incomplete profiles (< 85 engagement score)
        return c.engagementScore < 85 && c.lifecycleStage !== 'UNSUBSCRIBED';

      case 'COMMUNITY_CONVERSATIONS':
      case 'COMMUNITY':
        // All non-unsubscribed candidates for community engagement
        return c.lifecycleStage !== 'UNSUBSCRIBED';

      case 'PRODUCT_UPDATES':
      case 'WEEKLY_DIGEST':
        // All active platform candidates
        return c.lifecycleStage !== 'UNSUBSCRIBED';

      case 'CONVERSION':
        // High-engagement free users
        return c.engagementScore >= 50 && c.lifecycleStage !== 'UNSUBSCRIBED';

      case 'RE_ENGAGEMENT':
        // Inactive or dormant candidates
        return c.lifecycleStage === 'DORMANT' || c.engagementScore < 40;

      default:
        return true;
    }
  });
}

/**
 * Fetches the 5 most recent jobs from DB and formats them into responsive HTML email cards
 */
export async function getRecentJobsHtml(
  candidate: CRMCandidate,
  origin: string = 'https://jobsdart.in',
  limit: number = 5
): Promise<{ jobsHtml: string; jobIds: number[]; jobTitles: string[] }> {
  let jobs: any[] = [];
  try {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select('id, title, company_name, description, address, posted_at, created_at, status, salary_min_usd_cents, salary_max_usd_cents, experience_range, industry')
      .order('posted_at', { ascending: false })
      .limit(25);

    if (!error && data && data.length > 0) {
      // Filter for active/published
      jobs = data.filter((j: any) => !j.status || j.status === 'published' || j.status === 'active' || j.status === 'open');
      if (jobs.length === 0) jobs = data;
    }
  } catch (e) {
    console.warn('[CRM] Failed to fetch recent jobs:', e);
  }

  if (jobs.length === 0) {
    // Fallback 5 high-quality jobs
    jobs = [
      {
        id: 1,
        title: 'Senior Full Stack Engineer (Next.js & Node.js)',
        company_name: 'TechScale Global',
        address: 'Bengaluru / Remote',
        salary_range: '₹22,00,000 - ₹35,00,000 PA',
        industry: 'Software & Technology',
        posted_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Lead Frontend Developer (React & TypeScript)',
        company_name: 'Apex Cloud Solutions',
        address: 'Hyderabad / Hybrid',
        salary_range: '₹18,00,000 - ₹28,00,000 PA',
        industry: 'Fintech',
        posted_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Backend Systems Engineer (Python / Go)',
        company_name: 'DataVanguard AI',
        address: 'Pune / Remote',
        salary_range: '₹20,00,000 - ₹32,00,000 PA',
        industry: 'Artificial Intelligence',
        posted_at: new Date().toISOString(),
      },
      {
        id: 4,
        title: 'DevOps & Cloud Infrastructure Engineer',
        company_name: 'HyperScale Networks',
        address: 'Mumbai / Remote',
        salary_range: '₹19,00,000 - ₹30,00,000 PA',
        industry: 'Cloud Infrastructure',
        posted_at: new Date().toISOString(),
      },
      {
        id: 5,
        title: 'Product Designer & UI/UX Specialist',
        company_name: 'Nova Digital Labs',
        address: 'Gurgaon / Hybrid',
        salary_range: '₹15,00,000 - ₹24,00,000 PA',
        industry: 'Consumer Tech',
        posted_at: new Date().toISOString(),
      },
    ];
  }

  const selected5 = jobs.slice(0, limit);
  const jobIds = selected5.map((j) => j.id);
  const jobTitles = selected5.map((j) => j.title);

  const jobsHtml = selected5
    .map((job, idx) => {
      const company = job.company_name || job.companyName || 'Verified Employer';
      const loc = job.address || job.location || (candidate.currentCity ? `${candidate.currentCity}, ${candidate.country || ''}` : 'Remote / Hybrid');
      const salary = job.salary_range || job.salaryRange || (job.salary_min_usd_cents && job.salary_max_usd_cents ? `$${Math.round(job.salary_min_usd_cents / 100)} - $${Math.round(job.salary_max_usd_cents / 100)}` : 'Competitive Compensation');
      const industry = job.industry || 'Technology';
      const applyUrl = `${origin}/jobs/${job.id}`;

      return `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800; padding:3px 10px; border-radius:10px; text-transform:uppercase;">
              🔥 Fresh Opening #${idx + 1}
            </span>
            <span style="color:#64748b; font-size:11px; font-weight:700;">
              ${industry}
            </span>
          </div>
          <h3 style="margin:2px 0 6px 0; color:#0f172a; font-size:16px; font-weight:800; line-height:1.3;">
            <a href="${applyUrl}" style="color:#0f172a; text-decoration:none;">${job.title}</a>
          </h3>
          <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
            🏢 <strong>${company}</strong> &nbsp;•&nbsp; 📍 ${loc}
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
            <span style="color:#059669; font-size:12px; font-weight:800;">
              💰 ${salary}
            </span>
            <a href="${applyUrl}" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:11px; font-weight:900; padding:8px 16px; border-radius:8px; text-decoration:none; text-transform:uppercase;">
              Apply Now →
            </a>
          </div>
        </div>
      `;
    })
    .join('');

  return { jobsHtml, jobIds, jobTitles };
}

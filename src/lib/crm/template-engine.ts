import type { CRMCandidate, CampaignType, CampaignCategoryDefinition } from './types';

export interface EmailTemplateDefinition {
  id: string;
  name: string;
  category: CampaignType;
  subject: string;
  description: string;
  tags: string[];
  htmlLayout: (data: { candidate: CRMCandidate; jobsHtml: string; origin: string }) => string;
}

export const CAMPAIGN_STRUCTURE_CATALOG: CampaignCategoryDefinition[] = [
  {
    type: 'JOB_RECOMMENDATIONS',
    icon: '🎯',
    label: 'Job Recommendations',
    exampleSubject: '🎯 5 High-Match {{TOP_SKILL}} Jobs Handpicked for You, {{FIRSTNAME}}',
    triggerCondition: 'New matching job postings in database',
    recommendedFrequency: 'Daily / Weekly Digest',
    defaultTemplateId: 'tpl_job_recommendations',
    targetAudienceRule: 'Active candidates with skill matches & un-opted email preference',
  },
  {
    type: 'RECENT_JOBS_DIGEST',
    icon: '🔥',
    label: 'Recent Job Posts Digest',
    exampleSubject: '🔥 5 Fresh Job Openings Posted Today Matching Your Skills, {{FIRSTNAME}}',
    triggerCondition: 'New verified job postings added to JobsDart',
    recommendedFrequency: 'Weekly / Bi-Weekly Digest',
    defaultTemplateId: 'tpl_recent_jobs',
    targetAudienceRule: 'Active & passive jobseekers looking for fresh job opportunities',
  },
  {
    type: 'PROFILE_UPDATE_NUDGE',
    icon: '⚡',
    label: 'Keep Profile Up-to-Date (Recruiter Visibility)',
    exampleSubject: '⚡ Keep your profile up-to-date to get shortlisted by recruiters, {{FIRSTNAME}}',
    triggerCondition: 'Candidate profile missing recent experience, skills, or target locations',
    recommendedFrequency: 'Bi-Weekly / Monthly Nudge',
    defaultTemplateId: 'tpl_profile_update',
    targetAudienceRule: 'Jobseekers who need to update skills, location & resume for 4x recruiter visibility',
  },
  {
    type: 'COMMUNITY_CONVERSATIONS',
    icon: '💬',
    label: 'Community Conversations & Discussions',
    exampleSubject: '💬 Trending discussions in your community: Interview Tips, Career Growth & Salaries',
    triggerCondition: 'Active trending conversations & peer discussions in JobsDart Circles',
    recommendedFrequency: 'Weekly Community Digest',
    defaultTemplateId: 'tpl_community_conversations',
    targetAudienceRule: 'All candidates to drive peer-to-peer engagement and career discussions',
  },
  {
    type: 'FEATURE_EDUCATION',
    icon: '🧠',
    label: 'Feature Education',
    exampleSubject: 'Have you checked your ATS Score for senior tech roles, {{FIRSTNAME}}?',
    triggerCondition: 'User has profile but has not checked ATS Score',
    recommendedFrequency: '1–2 Automated Drip Emails',
    defaultTemplateId: 'tpl_feature_education',
    targetAudienceRule: 'Candidates with 0 ATS score checks in history',
  },
  {
    type: 'RESUME_BUILDER',
    icon: '📄',
    label: 'Resume Builder',
    exampleSubject: 'Build an ATS-friendly resume in 2 minutes, {{FIRSTNAME}}',
    triggerCondition: 'User has profile but no uploaded resume',
    recommendedFrequency: 'Targeted Onboarding Drip',
    defaultTemplateId: 'tpl_resume_builder',
    targetAudienceRule: 'Candidates missing resume_url in profile metadata',
  },
  {
    type: 'COMMUNITY',
    icon: '👥',
    label: 'Community Engagement',
    exampleSubject: 'Join discussions with top engineers & recruiters in {{LOCATION}}',
    triggerCondition: 'User has not joined any tech community circles',
    recommendedFrequency: 'Targeted Engagement Nudge',
    defaultTemplateId: 'tpl_community',
    targetAudienceRule: 'Candidates without community group memberships',
  },
  {
    type: 'PRODUCT_UPDATES',
    icon: '🚀',
    label: 'Product Updates',
    exampleSubject: 'What\'s new on JobsDart: AI Mock Interviews',
    triggerCondition: 'New feature released on JobsDart platform',
    recommendedFrequency: 'Monthly Newsletter',
    defaultTemplateId: 'tpl_product_updates',
    targetAudienceRule: 'All active & passive platform candidates',
  },
  {
    type: 'CONVERSION',
    icon: '💰',
    label: 'Premium Conversion',
    exampleSubject: 'Unlock Premium JobsDart features: Direct Recruiter Connect & Priority Chat',
    triggerCondition: 'Free user with high engagement score (Score >= 50)',
    recommendedFrequency: 'Carefully Targeted Upsell',
    defaultTemplateId: 'tpl_conversion',
    targetAudienceRule: 'High-intent free tier candidates',
  },
  {
    type: 'RE_ENGAGEMENT',
    icon: '🔄',
    label: 'Re-engagement',
    exampleSubject: 'Still looking for your next tech job, {{FIRSTNAME}}?',
    triggerCondition: 'User inactive on platform for 15–30 days',
    recommendedFrequency: 'After 15–30 days inactivity',
    defaultTemplateId: 'tpl_re_engagement',
    targetAudienceRule: 'Dormant candidates inactive >= 15 days',
  },
];

export const EMAIL_TEMPLATE_CATALOG: Record<string, EmailTemplateDefinition> = {
  // 1. 🎯 Job Recommendations Template
  tpl_job_recommendations: {
    id: 'tpl_job_recommendations',
    name: '🎯 Job Recommendations Digest',
    category: 'JOB_RECOMMENDATIONS',
    subject: '🎯 5 High-Match {{TOP_SKILL}} Jobs Handpicked for You, {{FIRSTNAME}}',
    description: 'Catchy, clickable job alert email featuring top 5 AI-matched opportunities.',
    tags: ['job-recommendation', 'daily-alert', 'ai-matching'],
    htmlLayout: ({ candidate, jobsHtml, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>AI Job Matches</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            
            <!-- Header Banner -->
            <div style="border-bottom:2px solid #6366f1; padding-bottom:16px; margin-bottom:24px; text-align:center;">
              <span style="background:#e0e7ff; color:#3730a3; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">🎯 AI-Powered Matches</span>
              <h1 style="color:#1e1b4b; margin:12px 0 4px 0; font-size:24px; font-weight:900;">Top 5 Job Matches Selected for You</h1>
              <p style="color:#64748b; font-size:12px; margin-top:4px; font-weight:600;">Handpicked based on your verified skills & career preferences</p>
            </div>

            <p style="font-size:15px; font-weight:600; color:#334155; margin-bottom:12px;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:20px;">
              Our AI matching engine analyzed thousands of active roles and found these <strong>5 high-compatibility opportunities</strong> tailored for your experience in <strong>${candidate.skills.slice(0, 3).join(', ') || 'Software Engineering'}</strong>:
            </p>

            <!-- Job Cards Container -->
            ${jobsHtml || `
              <!-- Card 1 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); color:#4338ca; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; text-transform:uppercase;">
                    ⚡ 98% AI Match
                  </span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:8px;">Remote</span>
                </div>
                <h3 style="margin:4px 0 6px 0; font-size:16px; font-weight:800;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Senior Full Stack Engineer (React, Node & Next.js) &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>TechScale Global</strong> &nbsp;•&nbsp; 📍 ${candidate.currentCity || 'Bengaluru'} • Remote
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:13px; font-weight:800;">💰 ₹24,00,000 - ₹38,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color:#ffffff; font-size:11px; font-weight:900; padding:8px 18px; border-radius:8px; text-decoration:none; text-transform:uppercase; box-shadow:0 2px 6px rgba(53,37,205,0.25);">
                    Apply Instantly &rarr;
                  </a>
                </div>
              </div>

              <!-- Card 2 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); color:#4338ca; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; text-transform:uppercase;">
                    ⚡ 95% AI Match
                  </span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:8px;">Hybrid</span>
                </div>
                <h3 style="margin:4px 0 6px 0; font-size:16px; font-weight:800;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Lead Frontend Engineer (TypeScript & Architecture) &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>Apex Cloud Solutions</strong> &nbsp;•&nbsp; 📍 Hyderabad • Hybrid
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:13px; font-weight:800;">💰 ₹20,00,000 - ₹32,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color:#ffffff; font-size:11px; font-weight:900; padding:8px 18px; border-radius:8px; text-decoration:none; text-transform:uppercase; box-shadow:0 2px 6px rgba(53,37,205,0.25);">
                    Apply Instantly &rarr;
                  </a>
                </div>
              </div>

              <!-- Card 3 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); color:#4338ca; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; text-transform:uppercase;">
                    ⚡ 93% AI Match
                  </span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:8px;">Remote</span>
                </div>
                <h3 style="margin:4px 0 6px 0; font-size:16px; font-weight:800;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Backend Systems & API Engineer (Python / Go) &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>DataVanguard AI</strong> &nbsp;•&nbsp; 📍 Pune • Remote
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:13px; font-weight:800;">💰 ₹22,00,000 - ₹34,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color:#ffffff; font-size:11px; font-weight:900; padding:8px 18px; border-radius:8px; text-decoration:none; text-transform:uppercase; box-shadow:0 2px 6px rgba(53,37,205,0.25);">
                    Apply Instantly &rarr;
                  </a>
                </div>
              </div>

              <!-- Card 4 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); color:#4338ca; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; text-transform:uppercase;">
                    ⚡ 91% AI Match
                  </span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:8px;">Remote</span>
                </div>
                <h3 style="margin:4px 0 6px 0; font-size:16px; font-weight:800;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Cloud DevOps & Platform Engineer &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>HyperScale Networks</strong> &nbsp;•&nbsp; 📍 Mumbai • Remote
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:13px; font-weight:800;">💰 ₹19,00,000 - ₹30,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color:#ffffff; font-size:11px; font-weight:900; padding:8px 18px; border-radius:8px; text-decoration:none; text-transform:uppercase; box-shadow:0 2px 6px rgba(53,37,205,0.25);">
                    Apply Instantly &rarr;
                  </a>
                </div>
              </div>

              <!-- Card 5 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:18px; padding:18px; margin-bottom:14px; box-shadow:0 3px 10px rgba(0,0,0,0.03);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%); color:#4338ca; font-size:11px; font-weight:800; padding:4px 10px; border-radius:12px; text-transform:uppercase;">
                    ⚡ 89% AI Match
                  </span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:8px;">Hybrid</span>
                </div>
                <h3 style="margin:4px 0 6px 0; font-size:16px; font-weight:800;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Senior Product Engineer & UI/UX Specialist &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>Nova Digital Labs</strong> &nbsp;•&nbsp; 📍 Gurgaon • Hybrid
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:13px; font-weight:800;">💰 ₹16,00,000 - ₹26,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); color:#ffffff; font-size:11px; font-weight:900; padding:8px 18px; border-radius:8px; text-decoration:none; text-transform:uppercase; box-shadow:0 2px 6px rgba(53,37,205,0.25);">
                    Apply Instantly &rarr;
                  </a>
                </div>
              </div>
            `}

            <!-- Catchy Bottom CTA Banner -->
            <div style="background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); border-radius:18px; padding:24px; text-align:center; color:#ffffff; margin-top:24px; box-shadow:0 6px 20px rgba(53,37,205,0.3);">
              <h4 style="margin:0 0 6px 0; font-size:17px; font-weight:900;">🚀 Discover 50+ More Live Matches</h4>
              <p style="margin:0 0 16px 0; font-size:13px; opacity:0.95;">Verified tech employers are reviewing applicants daily on JobsDart.</p>
              <a href="${origin}/jobs" style="display:inline-block; background:#ffffff; color:#3525cd; font-size:13px; font-weight:900; padding:12px 26px; border-radius:12px; text-decoration:none; text-transform:uppercase; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                Explore All Matching Roles &rarr;
              </a>
            </div>

            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 2. 🔥 Recent Job Posts Digest
  tpl_recent_jobs: {
    id: 'tpl_recent_jobs',
    name: '🔥 Recent Job Posts Digest',
    category: 'RECENT_JOBS_DIGEST',
    subject: '🔥 5 Fresh Job Openings Posted Today Matching Your Skills, {{FIRSTNAME}}',
    description: 'Sends top 5 recently posted opportunities with verified companies hiring right now.',
    tags: ['recent-jobs', 'fresh-openings', 'weekly-digest'],
    htmlLayout: ({ candidate, jobsHtml, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Recent Job Posts</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <div style="border-bottom:2px solid #ef4444; padding-bottom:16px; margin-bottom:24px; text-align:center;">
              <span style="background:#fee2e2; color:#b91c1c; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">🔥 Fresh Job Openings</span>
              <h1 style="color:#0f172a; margin:12px 0 4px 0; font-size:24px; font-weight:900;">Latest 5 Jobs on Jobs<span style="color:#ef4444;">Dart</span></h1>
              <p style="color:#64748b; font-size:12px; margin-top:4px; font-weight:600;">Top verified companies actively hiring this week</p>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155; margin-bottom:12px;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:20px;">
              Here are the <strong>5 most recent verified job postings</strong> added to JobsDart matching your domain in <strong>${candidate.skills.slice(0, 3).join(', ') || 'Technology'}</strong>:
            </p>
            ${jobsHtml || `
              <!-- Job Card 1 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800; padding:3px 10px; border-radius:10px; text-transform:uppercase;">🔥 Fresh Opening #1</span>
                  <span style="color:#64748b; font-size:11px; font-weight:700;">Software & Technology</span>
                </div>
                <h3 style="margin:2px 0 6px 0; color:#0f172a; font-size:16px; font-weight:800; line-height:1.3;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Senior Full Stack Engineer (Next.js & Node.js) &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>TechScale Global</strong> &nbsp;•&nbsp; 📍 ${candidate.currentCity || 'Bengaluru'} • Remote
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:12px; font-weight:800;">💰 ₹22,00,000 - ₹35,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:11px; font-weight:900; padding:8px 16px; border-radius:8px; text-decoration:none; text-transform:uppercase;">Apply Now →</a>
                </div>
              </div>

              <!-- Job Card 2 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800; padding:3px 10px; border-radius:10px; text-transform:uppercase;">🔥 Fresh Opening #2</span>
                  <span style="color:#64748b; font-size:11px; font-weight:700;">Fintech</span>
                </div>
                <h3 style="margin:2px 0 6px 0; color:#0f172a; font-size:16px; font-weight:800; line-height:1.3;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Lead Frontend Developer (React & TypeScript) &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>Apex Cloud Solutions</strong> &nbsp;•&nbsp; 📍 Hyderabad • Hybrid
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:12px; font-weight:800;">💰 ₹18,00,000 - ₹28,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:11px; font-weight:900; padding:8px 16px; border-radius:8px; text-decoration:none; text-transform:uppercase;">Apply Now →</a>
                </div>
              </div>

              <!-- Job Card 3 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800; padding:3px 10px; border-radius:10px; text-transform:uppercase;">🔥 Fresh Opening #3</span>
                  <span style="color:#64748b; font-size:11px; font-weight:700;">Artificial Intelligence</span>
                </div>
                <h3 style="margin:2px 0 6px 0; color:#0f172a; font-size:16px; font-weight:800; line-height:1.3;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Backend Systems Engineer (Python / Go) &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>DataVanguard AI</strong> &nbsp;•&nbsp; 📍 Pune • Remote
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:12px; font-weight:800;">💰 ₹20,00,000 - ₹32,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:11px; font-weight:900; padding:8px 16px; border-radius:8px; text-decoration:none; text-transform:uppercase;">Apply Now →</a>
                </div>
              </div>

              <!-- Job Card 4 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800; padding:3px 10px; border-radius:10px; text-transform:uppercase;">🔥 Fresh Opening #4</span>
                  <span style="color:#64748b; font-size:11px; font-weight:700;">Cloud Infrastructure</span>
                </div>
                <h3 style="margin:2px 0 6px 0; color:#0f172a; font-size:16px; font-weight:800; line-height:1.3;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">DevOps & Cloud Infrastructure Engineer &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>HyperScale Networks</strong> &nbsp;•&nbsp; 📍 Mumbai • Remote
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:12px; font-weight:800;">💰 ₹19,00,000 - ₹30,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:11px; font-weight:900; padding:8px 16px; border-radius:8px; text-decoration:none; text-transform:uppercase;">Apply Now →</a>
                </div>
              </div>

              <!-- Job Card 5 -->
              <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; margin-bottom:14px; box-shadow:0 2px 6px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:#fee2e2; color:#b91c1c; font-size:10px; font-weight:800; padding:3px 10px; border-radius:10px; text-transform:uppercase;">🔥 Fresh Opening #5</span>
                  <span style="color:#64748b; font-size:11px; font-weight:700;">Consumer Tech</span>
                </div>
                <h3 style="margin:2px 0 6px 0; color:#0f172a; font-size:16px; font-weight:800; line-height:1.3;">
                  <a href="${origin}/jobs" style="color:#0f172a; text-decoration:none;">Product Designer & UI/UX Specialist &rarr;</a>
                </h3>
                <p style="margin:0 0 8px 0; color:#475569; font-size:13px; font-weight:500;">
                  🏢 <strong>Nova Digital Labs</strong> &nbsp;•&nbsp; 📍 Gurgaon • Hybrid
                </p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:10px; padding-top:10px; border-top:1px dashed #e2e8f0;">
                  <span style="color:#059669; font-size:12px; font-weight:800;">💰 ₹15,00,000 - ₹24,00,000 PA</span>
                  <a href="${origin}/jobs" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:11px; font-weight:900; padding:8px 16px; border-radius:8px; text-decoration:none; text-transform:uppercase;">Apply Now →</a>
                </div>
              </div>
            `}
            <div style="background:linear-gradient(135deg, #1e293b 0%, #334155 100%); border-radius:16px; padding:20px; text-align:center; color:#ffffff; margin-top:24px;">
              <h4 style="margin:0 0 6px 0; font-size:15px; font-weight:800;">⚡ Be the First to Apply & Get Shortlisted</h4>
              <p style="margin:0 0 14px 0; font-size:12px; opacity:0.9;">Early applicants receive up to 3.5x higher response rates from hiring managers.</p>
              <a href="${origin}/jobs" style="display:inline-block; background:#ef4444; color:#ffffff; font-size:12px; font-weight:900; padding:10px 20px; border-radius:10px; text-decoration:none; text-transform:uppercase;">
                Explore All Fresh Openings
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 3. ⚡ Keep Profile Up-to-Date (Recruiter Visibility & Recommendations)
  tpl_profile_update: {
    id: 'tpl_profile_update',
    name: '⚡ Keep Profile Up-to-Date (Recruiter Visibility)',
    category: 'PROFILE_UPDATE_NUDGE',
    subject: '⚡ Keep your profile up-to-date to get shortlisted by recruiters, {{FIRSTNAME}}',
    description: 'Nudges jobseekers to update their skills, resume, experience & preferences for 4x recruiter shortlisting and accurate job recommendations.',
    tags: ['profile-update', 'recruiter-visibility', 'recommendations'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Keep Your Profile Up-to-Date</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #f1f5f9; margin-bottom:20px;">
              <span style="background:#e0e7ff; color:#3730a3; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">⚡ Recruiter Spotlight</span>
              <h2 style="color:#1e293b; font-size:22px; font-weight:800; margin:12px 0 4px 0;">Get 4x More Recruiter Shortlists & Accurate Job Matches</h2>
              <p style="color:#64748b; font-size:13px; margin:0;">Recruiters prioritize candidates with 100% updated profiles</p>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              Did you know? Recruiters on JobsDart search and filter candidates by <strong>recent skills, preferred cities, and updated resumes</strong>. Keeping your profile fresh ensures you get selected faster and receive hyper-accurate job recommendations!
            </p>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:20px; margin:20px 0;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size:14px; font-weight:800;">Why an Updated Profile Matters:</h4>
              <div style="margin-bottom:12px;">
                <strong style="color:#3525cd; font-size:13px;">🎯 Smarter AI Job Recommendations:</strong>
                <p style="margin:2px 0 0 0; font-size:12px; color:#64748b; line-height:1.5;">Our matching engine pairs you with roles matching your current salary expectations, location preferences, and top skills.</p>
              </div>
              <div style="margin-bottom:12px;">
                <strong style="color:#059669; font-size:13px;">🔍 Top Recruiter Search Ranking:</strong>
                <p style="margin:2px 0 0 0; font-size:12px; color:#64748b; line-height:1.5;">Verified recruiters actively filter for candidates who updated their profile within the last 30 days.</p>
              </div>
              <div>
                <strong style="color:#d97706; font-size:13px;">⚡ Priority Candidate Pipeline:</strong>
                <p style="margin:2px 0 0 0; font-size:12px; color:#64748b; line-height:1.5;">Complete candidate profiles receive top placement in hiring manager dashboards.</p>
              </div>
            </div>

            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:16px; margin:20px 0;">
              <h4 style="margin:0 0 8px 0; color:#1e40af; font-size:13px; font-weight:800;">Quick 2-Minute Checklist:</h4>
              <ul style="margin:0; padding-left:18px; font-size:12px; color:#1e3a8a; line-height:1.6;">
                <li>Add all your current technical & soft skills</li>
                <li>Set your preferred city, state & country</li>
                <li>Upload your latest PDF resume or use our AI builder</li>
                <li>Set your expected salary & notice period</li>
              </ul>
            </div>

            <div style="text-align:center; margin:28px 0;">
              <a href="${origin}/profile" style="display:inline-block; background:#3525cd; color:#ffffff; font-size:14px; font-weight:800; padding:14px 32px; border-radius:12px; text-decoration:none; box-shadow:0 4px 14px rgba(53,37,205,0.3);">
                Update My Profile Now →
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 4. 💬 Community Conversations & Discussions
  tpl_community_conversations: {
    id: 'tpl_community_conversations',
    name: '💬 Community Conversations & Discussions',
    category: 'COMMUNITY_CONVERSATIONS',
    subject: '💬 Trending discussions in your community: Interview tips, Referrals & Salaries',
    description: 'Invites candidates to join trending tech discussions, ask questions, share interview tips & request referrals in community circles.',
    tags: ['community-conversations', 'peer-discussions', 'networking'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Community Conversations</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #f1f5f9; margin-bottom:20px;">
              <span style="background:#f3e8ff; color:#7e22ce; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">💬 JobsDart Community Circles</span>
              <h2 style="color:#1e293b; font-size:22px; font-weight:800; margin:12px 0 4px 0;">Join Trending Tech Discussions & Ask for Referrals</h2>
              <p style="color:#64748b; font-size:13px; margin:0;">Interact directly with engineers, peers & recruiters</p>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              Looking for insider interview tips, salary negotiation advice, or direct company referrals? Join the active discussions happening in the <strong>JobsDart Community</strong> today!
            </p>

            <div style="margin:20px 0;">
              <h4 style="margin:0 0 12px 0; color:#1e293b; font-size:14px; font-weight:800;">🔥 Trending Discussions This Week:</h4>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size:13px; font-weight:800; color:#0f172a;">💡 "System Design & Coding Rounds at MNCs in 2026"</span>
                  <span style="font-size:11px; color:#7e22ce; font-weight:700; background:#f3e8ff; padding:2px 8px; border-radius:6px;">142 replies</span>
                </div>
                <p style="margin:0; font-size:12px; color:#64748b;">Insiders sharing recent round questions, expectations, and interview experiences.</p>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; margin-bottom:10px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size:13px; font-weight:800; color:#0f172a;">🤝 "Direct Employee Referral Requests & Open Roles"</span>
                  <span style="font-size:11px; color:#059669; font-weight:700; background:#dcfce7; padding:2px 8px; border-radius:6px;">89 referrals</span>
                </div>
                <p style="margin:0; font-size:12px; color:#64748b;">Connect with verified MNC employees open to referring qualified talent.</p>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size:13px; font-weight:800; color:#0f172a;">📈 "Tech Salary Insights & Counter-Offer Strategies"</span>
                  <span style="font-size:11px; color:#d97706; font-weight:700; background:#fef3c7; padding:2px 8px; border-radius:6px;">215 replies</span>
                </div>
                <p style="margin:0; font-size:12px; color:#64748b;">Real compensation breakdowns for frontend, backend, fullstack, and AI engineers.</p>
              </div>
            </div>

            <div style="text-align:center; margin:28px 0;">
              <a href="${origin}/communities" style="display:inline-block; background:#7e22ce; color:#ffffff; font-size:14px; font-weight:800; padding:14px 30px; border-radius:12px; text-decoration:none; box-shadow:0 4px 14px rgba(126,34,206,0.3);">
                Join Community Discussions →
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 2. 🧠 Feature Education Template
  tpl_feature_education: {
    id: 'tpl_feature_education',
    name: '🧠 Feature Education (ATS Score Check)',
    category: 'FEATURE_EDUCATION',
    subject: 'Have you checked your ATS Score for {{JOB_TITLE}} roles, {{FIRSTNAME}}?',
    description: 'Educates user on how to use the AI ATS Score Checker to pass candidate screeners.',
    tags: ['feature-education', 'ats-checker'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Check Your ATS Score</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <div style="text-align:center; padding-bottom:16px; border-bottom:1px solid #f1f5f9; margin-bottom:20px;">
              <span style="background:#e0e7ff; color:#3730a3; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">Feature Spotlight</span>
              <h2 style="color:#1e293b; font-size:22px; font-weight:800; margin:12px 0 4px 0;">75% of Resumes Are Rejected by ATS Filters</h2>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              Before you apply to top MNCs, ensure your resume contains the exact keywords recruiters are searching for.
            </p>
            <div style="background:#f1f5f9; border-left:4px solid #6366f1; border-radius:8px; padding:16px; margin:20px 0;">
              <h4 style="margin:0 0 6px 0; color:#1e293b; font-size:14px;">What the JobsDart ATS Checker Analyzes:</h4>
              <ul style="margin:0; padding-left:20px; font-size:13px; color:#475569; line-height:1.6;">
                <li>Keyword density & domain skill alignment</li>
                <li>Formatting compatibility for enterprise ATS algorithms</li>
                <li>Action verb impact & metric breakdown</li>
              </ul>
            </div>
            <div style="text-align:center; margin:28px 0;">
              <a href="${origin}/ats-score" style="display:inline-block; background:#3525cd; color:#ffffff; font-size:14px; font-weight:800; padding:14px 28px; border-radius:12px; text-decoration:none;">
                Check My Free ATS Score Now &rarr;
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 3. 📄 Resume Builder Template
  tpl_resume_builder: {
    id: 'tpl_resume_builder',
    name: '📄 Resume Builder Nudge',
    category: 'RESUME_BUILDER',
    subject: 'Build an ATS-friendly resume in 2 minutes, {{FIRSTNAME}}',
    description: 'Prompts candidates missing a resume to create an optimized resume with AI.',
    tags: ['resume-builder', 'onboarding'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Build Your Resume</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <div style="text-align:center; margin-bottom:24px;">
              <div style="font-size:36px; margin-bottom:8px;">📄</div>
              <h2 style="color:#1e293b; font-size:22px; font-weight:800; margin:0;">Complete Your JobsDart Candidate Profile</h2>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              Candidates with an uploaded or AI-generated resume and get recruiter responses on JobsDart.
            </p>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:12px; padding:18px; margin:20px 0; text-align:center;">
              <h4 style="margin:0 0 6px 0; color:#1e40af; font-size:15px;">Need an ATS-Ready Resume?</h4>
              <p style="margin:0 0 14px 0; color:#1e3a8a; font-size:13px;">Use our instant AI builder to generate professional resume templates tailored for top MNCs.</p>
              <a href="${origin}/resume-builder" style="display:inline-block; background:#2563eb; color:#ffffff; font-size:13px; font-weight:800; padding:10px 22px; border-radius:8px; text-decoration:none;">
                Launch AI Resume Builder
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 4. 👥 Community Engagement Template
  tpl_community: {
    id: 'tpl_community',
    name: '👥 Tech Community Circles Invitation',
    category: 'COMMUNITY',
    subject: 'Join tech discussions with engineers & recruiters in {{LOCATION}}',
    description: 'Invites candidates to join peer community circles and recruiter networks.',
    tags: ['community', 'engagement'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Join Tech Communities</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1;">
            <div style="text-align:center; margin-bottom:20px;">
              <span style="background:#fef3c7; color:#92400e; font-size:11px; font-weight:800; padding:6px 14px; border-radius:20px; text-transform:uppercase;">JobsDart Circles</span>
              <h2 style="color:#1e293b; font-size:22px; font-weight:800; margin:12px 0 4px 0;">Connect with Insiders in Your Field</h2>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              Join active tech circles to discuss salary benchmarks, interview experiences in real time.
            </p>
            <div style="text-align:center; margin:24px 0;">
              <a href="${origin}/communities" style="display:inline-block; background:#d97706; color:#ffffff; font-size:14px; font-weight:800; padding:12px 26px; border-radius:10px; text-decoration:none;">
                Explore Community Circles &rarr;
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 5. 🚀 Product Updates Template
  tpl_product_updates: {
    id: 'tpl_product_updates',
    name: '🚀 Product Updates Newsletter',
    category: 'PRODUCT_UPDATES',
    subject: 'What\'s new on JobsDart: AI Mock Interviews',
    description: 'Monthly product newsletter highlighting new features and portal additions.',
    tags: ['product-update', 'monthly-newsletter'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Product Updates</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1;">
            <div style="border-bottom:1px solid #e2e8f0; padding-bottom:16px; margin-bottom:20px; text-align:center;">
              <h2 style="color:#3525cd; margin:0; font-size:22px; font-weight:900;">🚀 JobsDart Product Newsletter</h2>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              We've launched several powerful upgrades on JobsDart this month to help you land your dream job faster:
            </p>
            <ul style="font-size:13px; color:#334155; line-height:1.8; margin:16px 0; padding-left:20px;">
              <li><strong>🤖 AI Mock Interview Practice:</strong> Simulate technical & HR interview rounds with real-time feedback.</li>
              <li><strong>📊 Live Salary Benchmarking:</strong> View transparent compensation data across top tech roles.</li>
            </ul>
            <div style="text-align:center; margin:24px 0;">
              <a href="${origin}/jobs" style="display:inline-block; background:#3525cd; color:#ffffff; font-size:13px; font-weight:800; padding:12px 24px; border-radius:10px; text-decoration:none;">
                Explore New Features &rarr;
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 6. 💰 Conversion / Premium Upsell Template
  tpl_conversion: {
    id: 'tpl_conversion',
    name: '💰 Premium Features Conversion',
    category: 'CONVERSION',
    subject: 'Unlock Unlimited Recruiter Chat, {{FIRSTNAME}}',
    description: 'Carefully targeted upgrade nudge for highly engaged candidates.',
    tags: ['conversion', 'premium-upsell'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unlock Premium Features</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1;">
            <div style="background:linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius:16px; padding:24px; text-align:center; color:#ffffff; margin-bottom:20px;">
              <h2 style="margin:0 0 6px 0; font-size:22px; font-weight:900;">Fast-Track Your Job Search</h2>
              <p style="margin:0; font-size:13px; opacity:0.95;">Get priority visibility in front of 500+ top tech recruiters</p>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              You have a high profile engagement score on JobsDart! Take your career to the next level with our premium candidate toolkit.
            </p>
            <div style="text-align:center; margin:24px 0;">
              <a href="${origin}/pricing" style="display:inline-block; background:#059669; color:#ffffff; font-size:14px; font-weight:800; padding:12px 26px; border-radius:10px; text-decoration:none;">
                View Premium Plans &rarr;
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },

  // 7. 🔄 Re-engagement Template
  tpl_re_engagement: {
    id: 'tpl_re_engagement',
    name: '🔄 Inactive Candidate Re-engagement',
    category: 'RE_ENGAGEMENT',
    subject: 'Still looking for your next tech job, {{FIRSTNAME}}?',
    description: 'Re-activates dormant candidates inactive for 15-30+ days.',
    tags: ['re-engagement', 'winback'],
    htmlLayout: ({ candidate, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Re-engage on JobsDart</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1;">
            <div style="text-align:center; margin-bottom:20px;">
              <h2 style="color:#1e293b; font-size:22px; font-weight:800; margin:0;">We Miss You on JobsDart!</h2>
              <p style="color:#64748b; font-size:13px; margin-top:4px;">50+ new jobs matching your target roles were posted this week</p>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6;">
              It has been a while since your last visit. Top tech companies are actively searching for candidates with your skills in <strong>${candidate.skills.slice(0, 2).join(', ') || 'Technology'}</strong>.
            </p>
            <div style="text-align:center; margin:24px 0;">
              <a href="${origin}/jobs" style="display:inline-block; background:#3525cd; color:#ffffff; font-size:14px; font-weight:800; padding:12px 26px; border-radius:10px; text-decoration:none;">
                Check New Job Matches &rarr;
              </a>
            </div>
            ${renderComplianceFooter(candidate, origin)}
          </div>
        </body>
      </html>
    `,
  },
};

function renderComplianceFooter(candidate: CRMCandidate, origin: string): string {
  return `
    <div style="margin-top:32px; border-top:1px solid #f1f5f9; padding-top:20px; font-size:11px; color:#94a3b8; text-align:center; line-height:1.6;">
      <p style="margin:0 0 6px 0;">JobsDart Career Platform Inc. | Bangalore, India & Worldwide</p>
      <p style="margin:0 0 6px 0;">You received this email because you created a candidate profile on JobsDart.</p>
      <p style="margin:0;">
        <a href="${origin}/profile" style="color:#6366f1; text-decoration:underline;">Email Preferences</a> &nbsp;|&nbsp; 
        <a href="${origin}/api/crm/preferences?email=${encodeURIComponent(candidate.email)}&action=unsubscribe" style="color:#94a3b8; text-decoration:underline;">Unsubscribe Instantly</a>
      </p>
    </div>
  `;
}

/**
 * Renders Email Template HTML Content
 */
export function renderCRMTemplate(
  templateId: string,
  candidate: CRMCandidate,
  jobsHtml: string = '',
  origin: string = 'https://jobsdart.in'
): { subject: string; htmlContent: string; tags: string[] } {
  const template = EMAIL_TEMPLATE_CATALOG[templateId] || EMAIL_TEMPLATE_CATALOG.tpl_job_recommendations;

  const firstName = candidate.name.split(' ')[0] || candidate.name;
  const topSkill = candidate.skills[0] ? (typeof candidate.skills[0] === 'string' ? candidate.skills[0] : (candidate.skills[0] as any).name) : 'Software';
  const location = candidate.currentCity || candidate.country || 'India';
  const jobTitle = candidate.headline || candidate.role || 'Software Engineer';

  const subject = template.subject
    .replace('{{FIRSTNAME}}', firstName)
    .replace('{{TOP_SKILL}}', topSkill)
    .replace('{{LOCATION}}', location)
    .replace('{{JOB_TITLE}}', jobTitle)
    .replace('{{MATCH_SCORE}}', '95')
    .replace('{{JOBS_COUNT}}', '5');

  const htmlContent = template.htmlLayout({ candidate, jobsHtml, origin });

  return {
    subject,
    htmlContent,
    tags: template.tags,
  };
}

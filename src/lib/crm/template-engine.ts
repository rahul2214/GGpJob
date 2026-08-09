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
    exampleSubject: '5 new React & Node.js jobs matching your profile',
    triggerCondition: 'New matching job postings in database',
    recommendedFrequency: 'Daily / Weekly Digest',
    defaultTemplateId: 'tpl_job_recommendations',
    targetAudienceRule: 'Active candidates with skill matches & un-opted email preference',
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
    exampleSubject: 'What\'s new on JobsDart: AI Mock Interviews & Employee Referrals',
    triggerCondition: 'New feature released on JobsDart platform',
    recommendedFrequency: 'Monthly Newsletter',
    defaultTemplateId: 'tpl_product_updates',
    targetAudienceRule: 'All active & passive platform candidates',
  },
  {
    type: 'CONVERSION',
    icon: '💰',
    label: 'Premium Conversion',
    exampleSubject: 'Unlock Premium JobsDart features: Direct Employee Referrals & Priority Chat',
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
    subject: '🎯 5 new {{TOP_SKILL}} jobs matching your profile, {{FIRSTNAME}}',
    description: 'Daily/Weekly job alert email with AI match scores and direct employee referral badges.',
    tags: ['job-recommendation', 'daily-alert'],
    htmlLayout: ({ candidate, jobsHtml, origin }) => `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Job Recommendations</title></head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            <div style="border-bottom:2px solid #6366f1; padding-bottom:16px; margin-bottom:24px; text-align:center;">
              <h1 style="color:#3525cd; margin:0; font-size:24px; font-weight:900;">Jobs<span style="color:#6366f1;">Dart</span> Recommendations</h1>
              <p style="color:#64748b; font-size:12px; margin-top:4px; font-weight:600;">Personalized career opportunities matching your profile</p>
            </div>
            <p style="font-size:15px; font-weight:600; color:#334155; margin-bottom:12px;">Hi ${candidate.name.split(' ')[0]},</p>
            <p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:20px;">
              Here are <strong>new verified job openings</strong> posted today that closely match your skills in <strong>${candidate.skills.slice(0, 3).join(', ') || 'Software Development'}</strong>:
            </p>
            ${jobsHtml}
            <div style="background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); border-radius:16px; padding:20px; text-align:center; color:#ffffff; margin-top:24px;">
              <h4 style="margin:0 0 6px 0; font-size:15px; font-weight:800;">Get Referred by MNC Insiders</h4>
              <p style="margin:0 0 14px 0; font-size:12px; opacity:0.9;">Bypass the ATS black hole. Connect directly with verified employees at top companies.</p>
              <a href="${origin}/jobs" style="display:inline-block; background:#ffffff; color:#3525cd; font-size:12px; font-weight:900; padding:10px 20px; border-radius:10px; text-decoration:none; text-transform:uppercase;">
                View All Recommendations
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
              Candidates with an uploaded or AI-generated resume get <strong>4x more employee referral invitations</strong> and recruiter responses on JobsDart.
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
              Join active tech circles to discuss salary benchmarks, interview experiences, and employee referral opportunities in real time.
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
    subject: 'What\'s new on JobsDart: AI Mock Interviews & Fast-Track Referrals',
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
              <li><strong>⚡ Instant Employee Referral Matching:</strong> Directly request referrals from verified MNC insiders.</li>
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
    subject: 'Unlock Unlimited Employee Referrals & Priority Recruiter Chat, {{FIRSTNAME}}',
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

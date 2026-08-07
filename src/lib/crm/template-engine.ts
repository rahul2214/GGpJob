import type { CRMCandidate } from './types';

export interface EmailTemplateDefinition {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  htmlLayout: (data: { candidate: CRMCandidate; jobsHtml: string; origin: string }) => string;
}

export const EMAIL_TEMPLATE_CATALOG: Record<string, EmailTemplateDefinition> = {
  tpl_ai_match_v2: {
    id: 'tpl_ai_match_v2',
    name: 'Personalized AI Skill Match Digest (Default)',
    subject: '🎯 {{MATCH_SCORE}}% AI Match: Top {{JOBS_COUNT}} Job Openings for {{FIRSTNAME}}',
    description: 'Dynamic job match recommendation email tailored for candidate skills, title, & location.',
    tags: ['ai-recommendation', 'crm-digest'],
    htmlLayout: ({ candidate, jobsHtml, origin }) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>JobsDart AI Career Match</title>
        </head>
        <body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; padding:24px; color:#1e293b; margin:0;">
          <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; border:1px solid #cbd5e1; box-shadow:0 10px 25px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <div style="border-bottom:1px solid #f1f5f9; padding-bottom:20px; margin-bottom:24px; text-align:center;">
              <h1 style="color:#3525cd; margin:0; font-size:26px; font-weight:900; tracking-tight:-0.5px;">JobsDart AI Career Match</h1>
              <p style="color:#64748b; font-size:13px; margin-top:6px; font-weight:600;">Top curated job recommendations tailored for ${candidate.name}</p>
            </div>

            <p style="font-size:15px; font-weight:600; color:#334155; margin-bottom:20px;">
              Hi ${candidate.name.split(' ')[0]},
            </p>
            <p style="font-size:14px; color:#475569; line-height:1.6; margin-bottom:24px;">
              Based on your verified skills and career target, our AI engine discovered top matching opportunities for you today:
            </p>

            <!-- Dynamic Job Cards List -->
            ${jobsHtml}

            <!-- CTA Banner -->
            <div style="background:linear-gradient(135deg, #3525cd 0%, #4f46e5 100%); border-radius:18px; padding:24px; text-align:center; color:#ffffff; margin-top:28px;">
              <h4 style="margin:0 0 8px 0; font-size:16px; font-weight:800;">Explore All Recommended Roles</h4>
              <p style="margin:0 0 16px 0; font-size:12px; opacity:0.9;">Sign in to your JobsDart dashboard to update your skill profile & target salary.</p>
              <a href="${origin}/jobs" style="display:inline-block; background:#ffffff; color:#3525cd; font-size:12px; font-weight:900; padding:12px 24px; border-radius:12px; text-decoration:none; text-transform:uppercase;">
                Open JobsDart App
              </a>
            </div>

            <!-- CAN-SPAM & Regional Compliance Footer -->
            <div style="margin-top:32px; border-top:1px solid #f1f5f9; padding-top:20px; font-size:11px; color:#94a3b8; text-align:center; line-height:1.6;">
              <p style="margin:0 0 6px 0;">JobsDart Career Platform Inc. | Bangalore, India & Worldwide</p>
              <p style="margin:0 0 6px 0;">You received this email because you created a candidate profile on JobsDart.</p>
              <p style="margin:0;">
                <a href="${origin}/profile" style="color:#6366f1; text-decoration:underline;">Email Preferences</a> &nbsp;|&nbsp; 
                <a href="${origin}/api/crm/preferences?email=${encodeURIComponent(candidate.email)}&action=unsubscribe" style="color:#94a3b8; text-decoration:underline;">Unsubscribe Instantly</a>
              </p>
            </div>

          </div>
        </body>
      </html>
    `,
  },
};

/**
 * Renders Email Template HTML Content
 */
export function renderCRMTemplate(
  templateId: string,
  candidate: CRMCandidate,
  jobsHtml: string,
  origin: string = 'https://www.jobsdart.in'
): { subject: string; htmlContent: string; tags: string[] } {
  const template = EMAIL_TEMPLATE_CATALOG[templateId] || EMAIL_TEMPLATE_CATALOG.tpl_ai_match_v2;
  
  const firstName = candidate.name.split(' ')[0] || candidate.name;
  const subject = template.subject
    .replace('{{FIRSTNAME}}', firstName)
    .replace('{{MATCH_SCORE}}', '95')
    .replace('{{JOBS_COUNT}}', '3');

  const htmlContent = template.htmlLayout({ candidate, jobsHtml, origin });

  return {
    subject,
    htmlContent,
    tags: template.tags,
  };
}

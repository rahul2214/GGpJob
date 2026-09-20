import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-protect-user-credentials-in-ai-job-automation',
  tint: 'rose',
  title: 'How to Protect User Credentials in AI Job Automation',
  heading: 'Protecting credentials in job automation',
  description:
    'Storing and using candidate credentials in an automation platform: why plaintext is not the only mistake, avoiding credential exposure to the model, and revocation.',
  keywords: [
    'protect user credentials ai automation',
    'credential storage job platform',
    'ai agent credential handling',
    'secrets management automation',
    'oauth vs password automation',
    'credential exposure llm',
    'job automation security',
    'secure candidate data',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  anchors: ['protecting credentials', 'credential store'],
  excerpt:
    'If your product signs into job boards for users, you are running a credential store — whether or not you designed one.',
  keyTakeaways: [
    'Adding a convenience feature can make you a credential store without a decision being taken.',
    'A scoped revocable token grants less and withdraws cleanly; prefer it to a password always.',
    'Encryption is necessary and leaks happen in memory, logs and error reports instead.',
    'Have your code perform the authenticated part so no secret ever enters a prompt.',
    'A kill switch is trivial to build calmly and impossible to improvise under pressure.',
  ],
  sections: [
    {
      heading: 'Accept what you are building',
      paragraphs: [
        'The moment an automation signs into a job board as the candidate, you hold credentials for third-party services belonging to your users. Many teams arrive at this without deciding to, by adding a convenience feature.',
        'That makes you a target with obligations: breach notification, a credible story about storage, and a plan for revocation. It is worth acknowledging explicitly before the architecture calcifies, because retrofitting is much harder than designing for it.',
        'The blast radius is wider than your product. People reuse passwords, so a credential store for job boards is in practice a partial credential store for email and banking too, and the consequence of a breach is not confined to the service you were automating.',
      ],
    },
    {
      heading: 'Prefer not holding them at all',
      paragraphs: [
        'The strongest position is having nothing worth stealing. Where a service supports OAuth or an API token, use it — a scoped, revocable token is categorically better than a password, because it grants less and can be withdrawn without the user changing anything.',
        'Where only a password works, consider whether the feature is worth it. "We sign in as you" is a significant liability for a convenience that saves a candidate one login, and a browser extension running under the user’s own session avoids the storage problem entirely.',
        'Session handoff is the middle option worth designing for. The user signs in themselves and your system receives only a session, which is sensitive but expiring, scoped and not reusable against anything else they own.',
      ],
      bullets: [
        'OAuth or scoped tokens wherever the service offers them',
        'A user-side extension acting under their own session',
        'Session handoff, where only a browser flow exists',
        'Storage only where none of those is possible, and only with encryption',
        'Never a shared credential across multiple users',
      ],
      table: {
        caption: 'What each option costs you in a breach',
        columns: ['Held', 'Scope', 'Revocable', 'Reusable elsewhere'],
        rows: [
          ['Nothing', 'None', '—', 'No'],
          ['Scoped token', 'One service, limited', 'Instantly', 'No'],
          ['Session cookie', 'One service, expiring', 'On expiry or logout', 'No'],
          ['Password', 'That service', 'User must change it', 'Often, yes'],
        ],
      },
    },
    {
      heading: 'Encryption is necessary and insufficient',
      paragraphs: [
        'Encrypting at rest is the obvious step and the easiest to get superficially right. Use a dedicated key management service, encrypt per user rather than with one application-wide key, and keep the key out of the same store as the data.',
        'The subtler problem is that the credential must be decrypted to be used, so it exists in memory, possibly in logs, possibly in an error report sent to a third-party monitoring service. Those paths leak far more often than databases do.',
        'Browser automation adds two of its own. A failure screenshot taken on a login page can capture an unmasked password field, and a full request trace can contain the submitted form body — both written automatically into artefact stores that nobody scoped as sensitive.',
        'Audit the leak paths as deliberately as the storage. Log redaction, error-reporting scrubbing, screenshot policy on authentication pages and what a trace records are four checks that take an afternoon and cover the ways this actually goes wrong.',
      ],
    },
    {
      heading: 'Keep credentials away from the model',
      paragraphs: [
        'A credential must never enter a prompt. Not in the context, not in a tool result, not in an error message the agent reads — because prompts get logged, sent to a provider, and sometimes reflected back in output.',
        'The pattern that works: the agent asks for an action, and your code performs the authenticated part. The agent invokes `submit_application(job_id)`; your server holds the session and does the signing in. The agent never sees a secret, so no amount of persuasion extracts one.',
        'This matters more than usual because the agent reads text written by strangers. A job posting can contain instructions aimed at it, and the only defence that holds is the agent having nothing to disclose — a prompt rule telling it to keep secrets is not a boundary.',
      ],
    },
    {
      heading: 'Revocation and visibility',
      paragraphs: [
        'Users must be able to see what is stored and remove it immediately, with the deletion actually propagating — including to any cached session, background worker or queued job holding a copy.',
        'Build a kill switch too: one action that invalidates every stored credential for a user, for the case where their account is compromised. It is rarely needed and impossible to improvise under pressure, which is exactly why it belongs in the design rather than the backlog.',
        'Record every use, and show it to them. A candidate who can see which service was accessed, when, and for what is a candidate who can spot something wrong — and that log is also the only way to answer the question honestly if they ask.',
        'Set an expiry on what you hold. A stored credential for a search that ended four months ago is pure liability, so prompting to reconnect after a period of inactivity costs a click and removes a standing risk nobody is watching.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should my platform store job board passwords?',
      a: 'Avoid it where possible. OAuth or scoped tokens grant less and can be revoked; a browser extension or session handoff avoids storage entirely. Store passwords only when nothing else works.',
    },
    {
      q: 'Is encrypting credentials at rest enough?',
      a: 'No. They must be decrypted to be used, so they exist in memory, logs, error reports, failure screenshots and request traces — paths that leak far more often than databases do.',
    },
    {
      q: 'Can an agent be given credentials to use directly?',
      a: 'It should not. Prompts get logged and sent to providers, and the agent reads text written by strangers. Have your code perform the authenticated part instead.',
    },
    {
      q: 'What does proper revocation require?',
      a: 'Immediate deletion that propagates to cached sessions, background workers and queued jobs — plus a single kill switch invalidating everything for a user.',
    },
    {
      q: 'Why is the blast radius wider than one job board?',
      a: 'Because people reuse passwords. A job board credential store is in practice a partial credential store for their email and banking too.',
    },
    {
      q: 'Should stored credentials expire?',
      a: 'Yes. A credential held for a search that ended months ago is pure liability, and prompting to reconnect after inactivity costs a click.',
    },
  ],
  related: ['ai-agent-security-permissions-sandboxing', 'ai-agent-privacy-resume-data', 'how-to-handle-authentication-in-ai-browser-agents'],
  references: [
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'Sensitive information disclosure and why prompt rules are not a boundary.',
    },
  ],
};

export default post;

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
  excerpt:
    'If your product signs into job boards for users, you are running a credential store — whether or not you designed one.',
  sections: [
    {
      heading: 'Accept what you are building',
      paragraphs: [
        'The moment an automation signs into a job board as the candidate, you hold credentials for third-party services belonging to your users. Many teams arrive at this without deciding to, by adding a convenience feature.',
        'That makes you a target with obligations: breach notification, a credible story about storage, and a plan for revocation. It is worth acknowledging explicitly before the architecture calcifies, because retrofitting is much harder than designing for it.',
      ],
    },
    {
      heading: 'Prefer not holding them at all',
      paragraphs: [
        'The strongest position is having nothing worth stealing. Where a service supports OAuth or an API token, use it — a scoped, revocable token is categorically better than a password, because it grants less and can be withdrawn without the user changing anything.',
        'Where only a password works, consider whether the feature is worth it. "We sign in as you" is a significant liability for a convenience that saves a candidate one login, and a browser extension running under the user’s own session avoids the storage problem entirely.',
      ],
      bullets: [
        'OAuth or scoped tokens wherever the service offers them',
        'A user-side extension acting under their own session',
        'Storage only where neither is possible, and only with encryption',
        'Never a shared credential across multiple users',
      ],
    },
    {
      heading: 'Encryption is necessary and insufficient',
      paragraphs: [
        'Encrypting at rest is the obvious step and the easiest to get superficially right. Use a dedicated key management service, encrypt per user rather than with one application-wide key, and keep the key out of the same store as the data.',
        'The subtler problem is that the credential must be decrypted to be used, so it exists in memory, possibly in logs, possibly in an error report sent to a third-party monitoring service. Those paths leak far more often than databases do.',
      ],
    },
    {
      heading: 'Keep credentials away from the model',
      paragraphs: [
        'A credential must never enter a prompt. Not in the context, not in a tool result, not in an error message the agent reads — because prompts get logged, sent to a provider, and sometimes reflected back in output.',
        'The pattern that works: the agent asks for an action, and your code performs the authenticated part. The agent invokes `submit_application(job_id)`; your server holds the session and does the signing in. The agent never sees a secret, so no amount of persuasion extracts one.',
      ],
    },
    {
      heading: 'Revocation and visibility',
      paragraphs: [
        'Users must be able to see what is stored and remove it immediately, with the deletion actually propagating — including to any cached session, background worker or queued job holding a copy.',
        'Build a kill switch too: one action that invalidates every stored credential for a user, for the case where their account is compromised. It is rarely needed and impossible to improvise under pressure, which is exactly why it belongs in the design rather than the backlog.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should my platform store job board passwords?',
      a: 'Avoid it where possible. OAuth or scoped tokens grant less and can be revoked; a browser extension running under the user’s own session avoids storage entirely. Store passwords only when nothing else works.',
    },
    {
      q: 'Is encrypting credentials at rest enough?',
      a: 'No. They must be decrypted to be used, so they exist in memory, logs and error reports sent to monitoring services — paths that leak far more often than databases do.',
    },
    {
      q: 'Can an agent be given credentials to use directly?',
      a: 'It should not. Prompts get logged and sent to providers. Have the agent request an action and let your own code perform the authenticated part, so no secret ever enters the model’s context.',
    },
    {
      q: 'What does proper revocation require?',
      a: 'Immediate deletion that propagates to cached sessions, background workers and queued jobs — plus a single kill switch invalidating everything for a user, which cannot be improvised during an incident.',
    },
  ],
  related: ['ai-agent-security-permissions-sandboxing', 'ai-agent-privacy-resume-data', 'how-to-handle-authentication-in-ai-browser-agents'],
};

export default post;

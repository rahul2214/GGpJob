import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-secure-ai-job-application-platform',
  tint: 'rose',
  title: 'How to Build a Secure AI Job Application Platform',
  heading: 'Securing a job application platform',
  description:
    'Security architecture for a platform acting on candidates’ behalf: tenant isolation, agent permissions, data minimisation, auditability and incident readiness.',
  keywords: [
    'secure ai job platform',
    'job platform security architecture',
    'multi tenant isolation ai',
    'candidate data security',
    'ai platform threat model',
    'job automation compliance',
    'agent platform security',
    'secure saas ai design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Security',
  anchors: ['secure job platform', 'tenant isolation'],
  excerpt:
    'A platform that acts for many candidates concentrates two things attackers want: personal data at scale, and the ability to act under someone else’s name.',
  keyTakeaways: [
    'Write the threat model before choosing controls, or you will secure the wrong area thoroughly.',
    'Make an unscoped query impossible to write rather than merely discouraged.',
    'The agent takes instructions from job descriptions, so it must never hold broad reach.',
    'The cheapest way to survive a breach is not holding the data.',
    'A kill switch is trivial to build calmly and impossible to improvise during an incident.',
  ],
  sections: [
    {
      heading: 'Threat model first',
      paragraphs: [
        'Write down who would attack this and what they would want before choosing controls. For a job platform the list is short and specific, and each entry implies a different defence.',
        'Doing this explicitly avoids the common outcome of a platform with thorough controls in one area and nothing in the area that actually matters.',
        'One threat on this list is unusual and easy to miss: the candidate’s current employer. Most users are searching while employed, and a notification, an email or a visible profile change reaching the wrong place is a harm the security model has to account for even though no attacker is involved.',
      ],
      bullets: [
        'A criminal harvesting CVs at scale for identity fraud',
        'A candidate trying to reach another candidate’s data',
        'A malicious employer influencing screening through a job description',
        'An attacker using your platform to send messages under a real name',
        'An insider with broad database access and no accountability',
        'The candidate’s current employer learning that they are searching',
      ],
    },
    {
      heading: 'Tenant isolation is the foundation',
      paragraphs: [
        'Every query must be scoped to a candidate, and that scoping should be enforced below the application layer wherever possible — row-level security, or a data access layer that cannot express an unscoped query.',
        'Relying on every developer remembering a `where user_id = ?` clause is how cross-tenant leaks happen. Make the unscoped query impossible to write rather than discouraged, because the failure only needs to occur once.',
        'Test it as a property rather than as a case. A test that authenticates as one user and attempts to read another’s records through every read path in the system is worth more than any amount of code review, and it keeps working as the codebase grows.',
      ],
    },
    {
      heading: 'The agent is a privileged component',
      paragraphs: [
        'An agent acting for a candidate should hold a credential scoped to that candidate and no more. Giving it a service account and trusting it to filter correctly means a single reasoning error becomes a breach across every user.',
        'Its tools should be task-shaped rather than general. `get_applications(candidate_id)` bounded to the current session is safe; a general query tool is an unbounded grant to a component that takes instructions from job descriptions.',
        'Treat the model’s output as untrusted input to everything downstream. Anything it produces that reaches a database, a shell, a URL or a template is an injection vector, and the fact that the text came from your own agent rather than from a user is not a reason to trust it.',
      ],
    },
    {
      heading: 'Credentials, if you must hold them at all',
      paragraphs: [
        'A platform that applies on a candidate’s behalf will be asked to store credentials for other services. The first question is whether that is avoidable — a proper authorisation flow gives scoped, revocable access without a password ever existing in your system, and it is the right answer wherever the provider offers it.',
        'Where a password genuinely must be stored, encrypt it with a key held outside the application database, decrypt only inside the component that uses it, and never let a plaintext credential enter a log, a trace, an error report or a model context.',
        'Make revocation a feature the user can reach in one action. A candidate who wants to disconnect an account should not need to contact support, and the same path is what you will use during an incident to invalidate everything at once.',
      ],
      bullets: [
        'Prefer scoped, revocable authorisation over stored passwords, always',
        'Encryption keys outside the application database',
        'No credential in logs, traces, error reports or model context',
        'One-action revocation, per connection',
        'A record of every use, with what it was used for',
      ],
      table: {
        caption: 'Threat to control',
        columns: ['Threat', 'Control that matters'],
        rows: [
          ['Bulk CV harvesting', 'Rate limits, anomaly detection on reads'],
          ['Cross-tenant access', 'Enforcement below the application layer'],
          ['Injection via job description', 'Narrow tools; treat retrieved text as data'],
          ['Messages sent under a real name', 'Human confirmation; per-user caps'],
          ['Insider access', 'Scoped access, immutable audit log'],
          ['Employer learning of a search', 'Data minimisation, no outbound leakage'],
        ],
      },
    },
    {
      heading: 'Minimise what you hold',
      paragraphs: [
        'The cheapest way to survive a breach is not to hold the data. Do you need a full CV stored, or an extracted structure plus the original only until processing completes? Do you need date of birth at all?',
        'Set retention deliberately and enforce it with a job that actually runs. Most platforms accumulate indefinitely because deletion was never built, and then discover during a security review that they hold five years of personal data with no business reason.',
        'Check what leaves as carefully as what you store. CVs sent to a model provider, documents in a third-party storage bucket and personal data in an analytics event are all copies of the same sensitive material sitting outside the controls you designed.',
      ],
    },
    {
      heading: 'Auditability, because you will be asked',
      paragraphs: [
        'Log every action taken on a candidate’s behalf with enough detail to reconstruct it: what was submitted where, which credential was used, what the agent was given as context. Make these logs immutable and separate from the application database.',
        'You need this for three reasons, and only one is security: a candidate will ask what was sent in their name, an employer may query a submission, and a regulator may ask how an automated decision was made.',
        'Logs of this kind are themselves sensitive, which is the part that gets forgotten. They contain the documents, the messages and the decisions, so they need the same access control and retention limits as the primary data rather than being an unexamined archive nobody scopes.',
      ],
    },
    {
      heading: 'Be ready for the incident',
      paragraphs: [
        'Decide in advance how you invalidate every stored credential, how you notify affected users, and how you stop all agent activity at once. A kill switch is trivial to build calmly and impossible to improvise during an incident.',
        'Test the restore path too. Backups that have never been restored are a plan rather than a capability, and the difference becomes apparent at the worst possible moment.',
        'Write the notification template before you need it. Breach notification is time-bound in most jurisdictions, and drafting the first honest account of what happened under that pressure is how organisations end up saying something they later have to correct.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most important security control for a job platform?',
      a: 'Tenant isolation enforced below the application layer — row-level security or a data layer that cannot express an unscoped query. Relying on every developer remembering a filter fails once and that is enough.',
    },
    {
      q: 'How should the AI agent be permissioned?',
      a: 'With a credential scoped to the candidate it is acting for, and task-shaped tools rather than general query access. It takes instructions from job descriptions, so it must not hold broad reach.',
    },
    {
      q: 'How long should candidate data be retained?',
      a: 'As briefly as the product genuinely requires, enforced by a deletion job that actually runs. Most platforms accumulate indefinitely simply because deletion was never built.',
    },
    {
      q: 'Why does an audit trail matter beyond security?',
      a: 'Candidates will ask what was sent in their name, employers may query a submission, and regulators may ask how an automated decision was made. Only one of those three reasons is security.',
    },
    {
      q: 'Which threat do platforms usually leave out?',
      a: 'The candidate current employer. Most users search while employed, and a notification reaching the wrong place is a real harm with no attacker involved.',
    },
    {
      q: 'Should the platform store passwords for other services?',
      a: 'Only where no authorisation flow exists. Scoped, revocable access means no password exists in your system at all, which is strictly better than any storage scheme.',
    },
  ],
  related: ['ai-agent-security-permissions-sandboxing', 'ai-agent-privacy-resume-data', 'how-to-protect-user-credentials-in-ai-job-automation'],
  references: [
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'Prompt injection, excessive agency and insecure output handling.',
    },
    {
      title: 'AI Risk Management Framework',
      url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      publisher: 'NIST',
      note: 'A structure for documenting risk decisions about an automated system.',
    },
  ],
};

export default post;

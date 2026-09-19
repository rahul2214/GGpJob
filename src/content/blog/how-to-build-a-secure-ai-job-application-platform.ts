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
  excerpt:
    'A platform that acts for many candidates concentrates two things attackers want: personal data at scale, and the ability to act under someone else’s name.',
  sections: [
    {
      heading: 'Threat model first',
      paragraphs: [
        'Write down who would attack this and what they would want before choosing controls. For a job platform the list is short and specific, and each entry implies a different defence.',
        'Doing this explicitly avoids the common outcome of a platform with thorough controls in one area and nothing in the area that actually matters.',
      ],
      bullets: [
        'A criminal harvesting CVs at scale for identity fraud',
        'A candidate trying to reach another candidate’s data',
        'A malicious employer influencing screening through a job description',
        'An attacker using your platform to send messages under a real name',
        'An insider with broad database access and no accountability',
      ],
    },
    {
      heading: 'Tenant isolation is the foundation',
      paragraphs: [
        'Every query must be scoped to a candidate, and that scoping should be enforced below the application layer wherever possible — row-level security, or a data access layer that cannot express an unscoped query.',
        'Relying on every developer remembering a `where user_id = ?` clause is how cross-tenant leaks happen. Make the unscoped query impossible to write rather than discouraged, because the failure only needs to occur once.',
      ],
    },
    {
      heading: 'The agent is a privileged component',
      paragraphs: [
        'An agent acting for a candidate should hold a credential scoped to that candidate and no more. Giving it a service account and trusting it to filter correctly means a single reasoning error becomes a breach across every user.',
        'Its tools should be task-shaped rather than general. `get_applications(candidate_id)` bounded to the current session is safe; a general query tool is an unbounded grant to a component that takes instructions from job descriptions.',
      ],
    },
    {
      heading: 'Minimise what you hold',
      paragraphs: [
        'The cheapest way to survive a breach is not to hold the data. Do you need a full CV stored, or an extracted structure plus the original only until processing completes? Do you need date of birth at all?',
        'Set retention deliberately and enforce it with a job that actually runs. Most platforms accumulate indefinitely because deletion was never built, and then discover during a security review that they hold five years of personal data with no business reason.',
      ],
    },
    {
      heading: 'Auditability, because you will be asked',
      paragraphs: [
        'Log every action taken on a candidate’s behalf with enough detail to reconstruct it: what was submitted where, which credential was used, what the agent was given as context. Make these logs immutable and separate from the application database.',
        'You need this for three reasons, and only one is security: a candidate will ask what was sent in their name, an employer may query a submission, and a regulator may ask how an automated decision was made.',
      ],
    },
    {
      heading: 'Be ready for the incident',
      paragraphs: [
        'Decide in advance how you invalidate every stored credential, how you notify affected users, and how you stop all agent activity at once. A kill switch is trivial to build calmly and impossible to improvise during an incident.',
        'Test the restore path too. Backups that have never been restored are a plan rather than a capability, and the difference becomes apparent at the worst possible moment.',
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
  ],
  related: ['ai-agent-security-permissions-sandboxing', 'ai-agent-privacy-resume-data', 'how-to-protect-user-credentials-in-ai-job-automation'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-browser-agent-for-job-applications',
  tint: 'rose',
  title: 'How to Build an AI Browser Agent for Job Applications',
  heading: 'A browser agent that applies to jobs',
  description:
    'Architecture for a browser agent that submits applications: perception, planning, acting, verification, session handling and the confirmation step.',
  keywords: [
    'ai browser agent',
    'browser agent job applications',
    'agent perception planning',
    'web automation ai',
    'form submission agent',
    'agent verification step',
    'browser session management',
    'application automation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  excerpt:
    'A browser agent that clicks Submit is holding a loaded action. Everything in the design should be about being certain before that moment.',
  sections: [
    {
      heading: 'Four loops, not one',
      paragraphs: [
        'The working structure is perceive, plan, act, verify — and the last one is the step teams skip. Without verification the agent believes its plan succeeded, and a plan that silently failed produces an application nobody sent and a confirmation nobody should trust.',
        'Verification means re-reading the page after acting: is the field now populated with what we intended, did the page advance, did a validation error appear. It roughly doubles the interactions and roughly eliminates the failure class where an agent confidently reports success.',
      ],
    },
    {
      heading: 'Give the model structure, not pixels',
      paragraphs: [
        'Screenshots are expensive per step and imprecise about what is clickable. An accessibility-tree representation — roles, labels, states, values — is cheaper, more accurate and directly actionable, because every node maps to something you can address.',
        'Keep screenshots for the cases the tree handles badly: canvas widgets, custom controls with no semantics, and diagnosing a failure after the fact. Using them as the primary perception channel is a cost decision most teams regret.',
      ],
      bullets: [
        'Accessibility tree as the default representation',
        'Screenshots reserved for visual-only widgets and failure diagnosis',
        'Stable element references passed back to the act step',
        'Page state summarised, not dumped, into the model context',
      ],
    },
    {
      heading: 'Separate reading from acting',
      paragraphs: [
        'The agent reads pages written by other people, and a page can contain text directed at an agent. If the same component reads that text and holds the ability to submit, an instruction on the page is an instruction to your submitter.',
        'Split them. One component extracts structure and produces a proposed action; another validates that proposal against a policy and executes it. The executor never reads page text as instruction — it only takes a typed action from the validator.',
      ],
    },
    {
      heading: 'Sessions are the operational headache',
      paragraphs: [
        'Every career site has its own login, its own session lifetime and its own idea of suspicious behaviour. Logins expire mid-run, multi-factor prompts appear, and an agent that cannot pause for a human is stuck.',
        'Design for interruption from the start: detect the authentication wall, persist the run state, ask the user, resume. And store whatever session material you keep encrypted and scoped to one user, because this is credential-adjacent data with a real blast radius.',
      ],
    },
    {
      heading: 'Confirm before submitting, always',
      paragraphs: [
        'Submission is irreversible and outward-facing: the employer sees what was sent, under the candidate’s name. Everything before it can be retried; it cannot.',
        'Show the candidate exactly what will be sent — every field, the documents, the free-text answers — and require an explicit action. This is the difference between a tool people trust with their reputation and one they try once.',
      ],
    },
    {
      heading: 'Fail loudly',
      paragraphs: [
        'Automation that half-works is worse than automation that stops. An agent that fills six of eight fields and submits has produced an application that makes the candidate look careless, and they will never know why.',
        'Define what complete means, check it before submitting, and stop with a clear report when it is not met. A stopped run is an inconvenience; a bad submission is damage.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the step most browser agents skip?',
      a: 'Verification. Without re-reading the page after acting, the agent believes its plan worked — producing confident reports of applications that were never sent.',
    },
    {
      q: 'Should a browser agent use screenshots or the DOM?',
      a: 'The accessibility tree by default: cheaper, more precise and directly actionable. Keep screenshots for canvas widgets, custom controls with no semantics, and diagnosing failures.',
    },
    {
      q: 'Why separate the component that reads pages from the one that acts?',
      a: 'Because pages are written by strangers and can contain instructions aimed at an agent. If the reader also holds submission ability, page text becomes a command to your submitter.',
    },
    {
      q: 'Should the agent submit without asking?',
      a: 'No. Submission is irreversible and goes out under the candidate name. Show every field and document that will be sent and require an explicit confirmation.',
    },
  ],
  related: ['how-to-build-an-ai-browser-agent-with-playwright', 'how-to-secure-an-ai-browser-agent', 'how-to-build-reliable-browser-automation'],
};

export default post;

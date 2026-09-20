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
  anchors: ['browser agent for job applications', 'perceive, plan, act, verify'],
  excerpt:
    'A browser agent that clicks Submit is holding a loaded action. Everything in the design should be about being certain before that moment.',
  keyTakeaways: [
    'Verification is the fourth loop and the one teams skip; without it, success reports are unfounded.',
    'The accessibility tree beats screenshots on cost, precision and actionability.',
    'Separate the component that reads pages from the one that can submit.',
    'Design for interruption — authentication walls and expiry are the normal case.',
    'Define what complete means and stop when it is not met; a stopped run is an inconvenience.',
  ],
  sections: [
    {
      heading: 'Four loops, not one',
      paragraphs: [
        'The working structure is perceive, plan, act, verify — and the last one is the step teams skip. Without verification the agent believes its plan succeeded, and a plan that silently failed produces an application nobody sent and a confirmation nobody should trust.',
        'Verification means re-reading the page after acting: is the field now populated with what we intended, did the page advance, did a validation error appear. It roughly doubles the interactions and roughly eliminates the failure class where an agent confidently reports success.',
        'It is also much cheaper than it sounds, because verification is a DOM read rather than a model call. Comparing the field’s value against what you intended costs nothing and catches the entire category of actions the page accepted visually and ignored internally.',
      ],
    },
    {
      heading: 'Give the model structure, not pixels',
      paragraphs: [
        'Screenshots are expensive per step and imprecise about what is clickable. An accessibility-tree representation — roles, labels, states, values — is cheaper, more accurate and directly actionable, because every node maps to something you can address.',
        'Keep screenshots for the cases the tree handles badly: canvas widgets, custom controls with no semantics, and diagnosing a failure after the fact. Using them as the primary perception channel is a cost decision most teams regret.',
        'Summarise the tree before it reaches the model. A full accessibility tree for a complex page is enormous, and filtering to interactive elements with their labels and states produces a fraction of the tokens with no loss of anything the agent needs to act on.',
      ],
      bullets: [
        'Accessibility tree as the default representation',
        'Screenshots reserved for visual-only widgets and failure diagnosis',
        'Stable element references passed back to the act step',
        'Page state summarised, not dumped, into the model context',
      ],
      table: {
        caption: 'Perception channels compared',
        columns: ['Channel', 'Cost', 'Precision', 'Use for'],
        rows: [
          ['Accessibility tree', 'Low', 'High', 'Everything, by default'],
          ['Raw DOM', 'High', 'High', 'Rarely — too much noise'],
          ['Screenshot', 'Highest', 'Moderate', 'Canvas widgets, diagnosis'],
          ['Text extraction', 'Lowest', 'Low', 'Reading content, not acting'],
        ],
      },
    },
    {
      heading: 'Separate reading from acting',
      paragraphs: [
        'The agent reads pages written by other people, and a page can contain text directed at an agent. If the same component reads that text and holds the ability to submit, an instruction on the page is an instruction to your submitter.',
        'Split them. One component extracts structure and produces a proposed action; another validates that proposal against a policy and executes it. The executor never reads page text as instruction — it only takes a typed action from the validator.',
        'The validator is where the real constraints live: this origin is allowed, this action type is permitted here, this field is on the never-fill list, this submission requires a human confirmation that has been recorded. None of those can be argued with, because the component enforcing them does not read the page.',
      ],
    },
    {
      heading: 'Sessions are the operational headache',
      paragraphs: [
        'Every career site has its own login, its own session lifetime and its own idea of suspicious behaviour. Logins expire mid-run, multi-factor prompts appear, and an agent that cannot pause for a human is stuck.',
        'Design for interruption from the start: detect the authentication wall, persist the run state, ask the user, resume. And store whatever session material you keep encrypted and scoped to one user, because this is credential-adjacent data with a real blast radius.',
        'Isolate the browser context per candidate without exception. A reused profile carrying one person’s cookies into another’s run is a straightforward data leak, and it is easy to introduce accidentally when optimising away browser startup time.',
      ],
    },
    {
      heading: 'What it costs to run, and where',
      paragraphs: [
        'A browser agent is the most expensive component in a job application pipeline by a wide margin, and the cost is dominated by model calls per step rather than by browser compute. Reducing steps matters far more than making each one faster.',
        'The largest saving available is not reaching the agent at all. A known form handled by a stored field mapping costs a deterministic fill and a verification read, so the agent’s job becomes handling the long tail rather than every application — which changes the economics by an order of magnitude.',
        'After that, the savings come from perception discipline: filtered accessibility trees rather than raw dumps, no screenshot where a DOM read will do, and no re-perception of a page that has not changed since the last observation.',
        'Set a per-application step budget and stop when it is exhausted. An agent that has taken forty steps on one form is not close to finishing, and stopping with a clear handoff is both cheaper and more useful than letting it continue to an unpredictable end.',
      ],
      bullets: [
        'Route known forms away from the agent entirely',
        'Filter the perception payload; never dump a page',
        'Cap steps per application, and hand off when the cap is hit',
        'Reuse the browser process, never the browser profile',
      ],
    },
    {
      heading: 'Confirm before submitting, always',
      paragraphs: [
        'Submission is irreversible and outward-facing: the employer sees what was sent, under the candidate’s name. Everything before it can be retried; it cannot.',
        'Show the candidate exactly what will be sent — every field, the documents, the free-text answers — and require an explicit action. This is the difference between a tool people trust with their reputation and one they try once.',
        'Present the assembled application rather than the browser. A screenshot of a form is hard to check; a readable list of what each field contains, with anything the system could not verify flagged, is a review someone will actually perform.',
      ],
    },
    {
      heading: 'Fail loudly',
      paragraphs: [
        'Automation that half-works is worse than automation that stops. An agent that fills six of eight fields and submits has produced an application that makes the candidate look careless, and they will never know why.',
        'Define what complete means, check it before submitting, and stop with a clear report when it is not met. A stopped run is an inconvenience; a bad submission is damage.',
        'Make the stop recoverable in a way the candidate can act on. The saved state, the screen it reached, what blocked it and a direct link turn a failure into three minutes of their time, which is the difference between a tool they keep and one they uninstall after the first incomplete run.',
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
      a: 'A filtered accessibility tree by default: cheaper, more precise and directly actionable. Keep screenshots for canvas widgets, custom controls with no semantics, and diagnosing failures.',
    },
    {
      q: 'Why separate the component that reads pages from the one that acts?',
      a: 'Because pages are written by strangers and can contain instructions aimed at an agent. If the reader also holds submission ability, page text becomes a command to your submitter.',
    },
    {
      q: 'Should the agent submit without asking?',
      a: 'No. Submission is irreversible and goes out under the candidate name. Show every field and document that will be sent and require an explicit confirmation.',
    },
    {
      q: 'Where does the cost actually go?',
      a: 'Model calls per step, not browser compute. Routing known forms to a stored mapping so the agent never sees them is the single largest saving available.',
    },
    {
      q: 'What should a step budget do when it runs out?',
      a: 'Stop and hand off. An agent forty steps into one form is not close to finishing, and a clear handoff is cheaper and more useful than an unpredictable continuation.',
    },
  ],
  related: ['how-to-build-an-ai-browser-agent-with-playwright', 'how-to-secure-an-ai-browser-agent', 'how-to-build-reliable-browser-automation'],
};

export default post;

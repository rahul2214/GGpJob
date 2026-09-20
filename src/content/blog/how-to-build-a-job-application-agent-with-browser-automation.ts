import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-job-application-agent-with-browser-automation',
  tint: 'rose',
  title: 'How to Build a Job Application Agent Using AI and Browser Automation',
  heading: 'Combining a model with a browser',
  description:
    'How to divide work between deterministic automation and model reasoning, so the agent is neither brittle scripting nor an expensive guess at every step.',
  keywords: [
    'job application agent',
    'ai browser automation',
    'deterministic vs model steps',
    'form automation ai',
    'application agent architecture',
    'hybrid automation',
    'agent cost control',
    'browser agent design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['application agent', 'deterministic steps'],
  excerpt:
    'The design question is not whether to use a model. It is which of the steps genuinely need one.',
  keyTakeaways: [
    'Pure scripting rots; pure model reasoning is slow, costly and non-deterministic where the answer is known.',
    'Split by whether the step has a single correct answer.',
    'Learn a form once, store the mapping, and replay it deterministically thereafter.',
    'Verify after every action — the compounding failure is continuing past a silent one.',
    'Stop before submission, and stop entirely rather than inventing a required answer.',
  ],
  sections: [
    {
      heading: 'Two failure modes to avoid',
      paragraphs: [
        'Pure scripting breaks the moment a site changes, and career sites change constantly. Every broken selector becomes a support ticket, and the maintenance grows with the number of sites supported.',
        'Pure model reasoning at every step is robust and slow and expensive, and it introduces non-determinism into operations that have one correct answer. Asking a model to work out that the "Next" button advances the form is spending money on a known fact.',
        'Both failures are usually arrived at by accident rather than by decision. A team scripts because the first three sites were easy, or reaches for the model because the first demo was impressive, and the architecture is set before anyone has asked which steps actually need judgement.',
      ],
    },
    {
      heading: 'Split by whether the answer is known',
      paragraphs: [
        'Deterministic code handles everything with a single correct answer: navigation, clicking a known control, uploading a file, reading a field, checking whether the page advanced. These are fast, free and testable.',
        'The model handles genuine ambiguity: what is this unlabelled field asking for, how should this open question be answered, is this validation error about the thing we just typed. That division keeps most steps cheap and reserves reasoning for where it is needed.',
        'Notice that mapping an interpreted field back to profile data is on the deterministic side. Once the model has concluded that a field wants a phone number, the value comes from a lookup — letting it produce the value as well is how a wrong number reaches an employer with no record of where it came from.',
      ],
      bullets: [
        'Deterministic — navigation, known controls, uploads, verification',
        'Model — interpreting unfamiliar fields and free-text questions',
        'Deterministic — mapping an interpreted field back to profile data',
        'Human — anything irreversible',
      ],
      table: {
        caption: 'Who owns each step',
        columns: ['Step', 'Owner', 'Why'],
        rows: [
          ['Navigate to the posting', 'Code', 'One correct answer'],
          ['Identify what a field wants', 'Model', 'Genuine ambiguity'],
          ['Supply the value', 'Code', 'It is a lookup, not a judgement'],
          ['Answer an open question', 'Model, then human', 'Read by a person'],
          ['Upload a document', 'Code', 'Known control, verify after'],
          ['Interpret a validation error', 'Model', 'Unstructured and varied'],
          ['Submit', 'Human', 'Irreversible and public'],
        ],
      },
    },
    {
      heading: 'Learn the site once, then replay',
      paragraphs: [
        'The first encounter with a form is expensive: the model reads it, works out what each field wants and how the flow is structured. That understanding is worth keeping.',
        'Store the derived mapping keyed by the form’s structural signature. Subsequent applications to the same site replay it deterministically and fall back to reasoning only when the signature changes — which cuts cost per application dramatically over time.',
        'The signature should be derived from the form’s structure rather than the page URL, because the same form appears at a different URL for every posting. Field names, input types and their order make a stable key; the address bar does not.',
        'Promote cautiously. Two or three consistent successful runs before a mapping is trusted prevents caching a misinterpretation, and keeping the model path as the fallback means a changed form degrades to slow rather than to broken.',
      ],
    },
    {
      heading: 'Verify every step, not just the end',
      paragraphs: [
        'The compounding failure is an agent that continues after a step silently failed. A field that did not accept the value, a page that did not advance, an upload that did not register — each looks fine to a planner that never re-reads the page.',
        'After every action, check the resulting state. It roughly doubles the interactions and it is the single change that turns an impressive demo into something that can be trusted with a real application.',
        'Verification can be deterministic and therefore nearly free. Reading a field back after typing into it is a DOM operation, not a model call, and the same is true of checking that the step indicator advanced or that an uploaded filename now appears — so the cost of this discipline is far lower than it first sounds.',
      ],
    },
    {
      heading: 'Session, state and restarting safely',
      paragraphs: [
        'A long flow will be interrupted: a session expires, a network call fails, the process restarts. Without recorded state the agent either abandons work silently or begins again and submits a second copy, and both are worse than the interruption.',
        'Record progress at each step boundary with an idempotency key derived from candidate, employer and role. On restart, the first question is whether this application already exists, and that check runs before the browser opens rather than after.',
        'Credentials belong in a scoped store rather than in the agent’s context, and sessions should be isolated per candidate. A shared browser profile that carries one candidate’s cookies into another’s run is a data leak with no technical difficulty behind it.',
      ],
      bullets: [
        'Progress recorded at every step boundary, not only at the end',
        'An idempotency key checked before the browser opens',
        'Isolated browser context per candidate, never shared',
        'Credentials from a scoped store, never in the prompt',
        'A clean resume path, since interruption is the normal case',
      ],
    },
    {
      heading: 'Stop before the irreversible step',
      paragraphs: [
        'Everything up to submission can be retried. Submission cannot, and it goes out under the candidate’s name to an employer who will read it as their own work.',
        'Show the complete assembled application and require an explicit confirmation. If the agent cannot complete a required field with something true, it stops and reports rather than guessing — an application with a fabricated answer is worse than one not sent.',
        'Make stopping cheap for the candidate to recover from. A saved partial application, a note on what blocked it and a direct link turns a failure into three minutes of their time, which is the difference between a tool they keep using and one they abandon after the first incomplete run.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why not script job applications deterministically?',
      a: 'Career sites change constantly, so every broken selector becomes a support ticket and maintenance grows with the number of sites supported.',
    },
    {
      q: 'Why not let the model drive every step?',
      a: 'It is slow, expensive and non-deterministic for operations with one correct answer. Reasoning that a Next button advances the form is paying for a known fact.',
    },
    {
      q: 'How do I reduce cost across repeated applications?',
      a: 'Store the field mapping derived on first encounter, keyed by the form structural signature, and replay it deterministically until the signature changes.',
    },
    {
      q: 'What happens if a required field cannot be answered truthfully?',
      a: 'The agent stops and reports. An application containing a fabricated answer is worse for the candidate than one that was never sent.',
    },
    {
      q: 'Why key the cached mapping on structure rather than URL?',
      a: 'Because the same form appears at a different URL for every posting. Field names, types and order make a stable key; the address bar does not.',
    },
    {
      q: 'What stops a restart from submitting twice?',
      a: 'An idempotency key derived from candidate, employer and role, checked before the browser opens. Interruption is the normal case, not the exception.',
    },
  ],
  related: ['how-to-build-an-ai-browser-agent-for-job-applications', 'browser-automation-vs-ai-browser-agents', 'how-to-build-an-ai-agent-that-fills-job-forms'],
};

export default post;

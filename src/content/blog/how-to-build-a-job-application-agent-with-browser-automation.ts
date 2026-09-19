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
  excerpt:
    'The design question is not whether to use a model. It is which of the steps genuinely need one.',
  sections: [
    {
      heading: 'Two failure modes to avoid',
      paragraphs: [
        'Pure scripting breaks the moment a site changes, and career sites change constantly. Every broken selector becomes a support ticket, and the maintenance grows with the number of sites supported.',
        'Pure model reasoning at every step is robust and slow and expensive, and it introduces non-determinism into operations that have one correct answer. Asking a model to work out that the "Next" button advances the form is spending money on a known fact.',
      ],
    },
    {
      heading: 'Split by whether the answer is known',
      paragraphs: [
        'Deterministic code handles everything with a single correct answer: navigation, clicking a known control, uploading a file, reading a field, checking whether the page advanced. These are fast, free and testable.',
        'The model handles genuine ambiguity: what is this unlabelled field asking for, how should this open question be answered, is this validation error about the thing we just typed. That division keeps most steps cheap and reserves reasoning for where it is needed.',
      ],
      bullets: [
        'Deterministic — navigation, known controls, uploads, verification',
        'Model — interpreting unfamiliar fields and free-text questions',
        'Deterministic — mapping an interpreted field back to profile data',
        'Human — anything irreversible',
      ],
    },
    {
      heading: 'Learn the site once, then replay',
      paragraphs: [
        'The first encounter with a form is expensive: the model reads it, works out what each field wants and how the flow is structured. That understanding is worth keeping.',
        'Store the derived mapping keyed by the form’s structural signature. Subsequent applications to the same site replay it deterministically and fall back to reasoning only when the signature changes — which cuts cost per application dramatically over time.',
      ],
    },
    {
      heading: 'Verify every step, not just the end',
      paragraphs: [
        'The compounding failure is an agent that continues after a step silently failed. A field that did not accept the value, a page that did not advance, an upload that did not register — each looks fine to a planner that never re-reads the page.',
        'After every action, check the resulting state. It roughly doubles the interactions and it is the single change that turns an impressive demo into something that can be trusted with a real application.',
      ],
    },
    {
      heading: 'Stop before the irreversible step',
      paragraphs: [
        'Everything up to submission can be retried. Submission cannot, and it goes out under the candidate’s name to an employer who will read it as their own work.',
        'Show the complete assembled application and require an explicit confirmation. If the agent cannot complete a required field with something true, it stops and reports rather than guessing — an application with a fabricated answer is worse than one not sent.',
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
  ],
  related: ['how-to-build-an-ai-browser-agent-for-job-applications', 'browser-automation-vs-ai-browser-agents', 'how-to-build-an-ai-agent-that-fills-job-forms'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-handles-different-forms',
  tint: 'violet',
  title: 'How to Build an AI Agent That Handles Different Job Application Forms',
  heading: 'Handling any application form',
  description:
    'Building an agent that copes with forms it has never seen: normalising questions, reusing past answers, multi-step flows, and knowing when to stop.',
  keywords: [
    'ai agent different forms',
    'unknown form handling ai',
    'question normalisation',
    'answer reuse automation',
    'multi step form agent',
    'conditional fields automation',
    'form variation handling',
    'application form agent',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'The variety is unbounded but not random. Most novel questions are old questions in new words, and exploiting that is what makes the problem finite.',
  sections: [
    {
      heading: 'Novel forms, familiar questions',
      paragraphs: [
        'Every employer writes their own form, so you will always meet layouts you have not seen. But the underlying questions repeat endlessly: notice period, salary expectation, willingness to relocate, how you heard about the role.',
        'So the problem is not "handle infinite forms". It is "recognise that this new wording is a question we have answered before" — which is a matching problem, and a tractable one.',
      ],
    },
    {
      heading: 'Normalise the question, not the field',
      paragraphs: [
        'When a human answers an unmapped question, do not store the answer against that field on that page. Store it against a normalised form of the question, so it can be matched when the same thing is asked differently elsewhere.',
        'Embedding the question text and matching by similarity works well here, because these questions are short and semantically distinctive. "When could you start?" and "What is your notice period?" are close enough to link, and far enough from anything else to avoid false matches.',
      ],
      bullets: [
        'Store answers against a canonical question, not a field id',
        'Match new questions by meaning, with a confidence threshold',
        'Keep the original wording for review, and the answer separately',
        'Let the candidate edit their canonical answers in one place',
      ],
    },
    {
      heading: 'Multi-step flows need explicit state',
      paragraphs: [
        'Many applications span several pages, sometimes with a progress indicator, sometimes not, sometimes with a step that appears only for certain answers. An agent treating each page independently loses track of where it is.',
        'Track the flow explicitly: which step, what has been submitted, what remains. Then a crash or a session expiry can resume rather than restart — which matters because restarting a partially submitted application can create a duplicate.',
      ],
    },
    {
      heading: 'Conditional fields will catch you out',
      paragraphs: [
        'Selecting a country reveals a state dropdown. Ticking a box reveals three more questions. A form that looked complete when you enumerated it is not complete after you fill it.',
        'Re-enumerate after every meaningful change rather than working from the initial list. This single habit eliminates the most common cause of applications submitted with required fields left empty.',
      ],
    },
    {
      heading: 'Know when to stop',
      paragraphs: [
        'The agent should stop and ask rather than guess whenever it meets something it cannot map with confidence, an unexpected validation error it cannot resolve, a file upload of a type it does not hold, or anything resembling a declaration.',
        'Make stopping cheap and informative: show the question, the page, and what it would have answered. A well-designed escalation takes the candidate ten seconds and teaches the system something permanent, which is a far better trade than a confident wrong answer.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How can an agent handle forms it has never seen?',
      a: 'By recognising that most novel questions are familiar ones in new words. Store answers against a normalised question rather than a field id, and match new questions by meaning.',
    },
    {
      q: 'Why re-enumerate fields after filling some?',
      a: 'Because conditional fields appear based on earlier answers. A form that looked complete when first read is not complete after you fill it, and this is the main cause of submissions with empty required fields.',
    },
    {
      q: 'How should multi-step applications be handled?',
      a: 'With explicit flow state — which step, what was submitted, what remains — so a crash or session expiry resumes rather than restarts. Restarting a partially submitted application risks a duplicate.',
    },
    {
      q: 'When should the agent stop and ask?',
      a: 'Any unmappable question, unresolved validation error, missing file type, or anything resembling a declaration. Make the escalation informative — it costs ten seconds and permanently improves the system.',
    },
  ],
  related: ['how-to-build-a-universal-ats-automation-agent', 'how-to-build-an-ai-agent-that-fills-job-forms', 'how-to-build-reliable-browser-automation'],
};

export default post;

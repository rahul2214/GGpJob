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
  anchors: ['different forms', 'question normalisation'],
  excerpt:
    'The variety is unbounded but not random. Most novel questions are old questions in new words, and exploiting that is what makes the problem finite.',
  keyTakeaways: [
    'The problem is matching a new wording to a known question, not handling infinite forms.',
    'Store answers against a canonical question, never against a field on a page.',
    'Multi-step flows need explicit state, or a restart creates a duplicate.',
    'Re-enumerate after every meaningful change — conditional fields appear late.',
    'Escalation should be informative and cheap; it permanently improves the system.',
  ],
  sections: [
    {
      heading: 'Novel forms, familiar questions',
      paragraphs: [
        'Every employer writes their own form, so you will always meet layouts you have not seen. But the underlying questions repeat endlessly: notice period, salary expectation, willingness to relocate, how you heard about the role.',
        'So the problem is not "handle infinite forms". It is "recognise that this new wording is a question we have answered before" — which is a matching problem, and a tractable one.',
        'The distribution helps more than it seems. A small set of questions accounts for the large majority of fields a candidate will ever meet, so a modest library of canonical answers covers most of the work and the escalation rate falls sharply after the first dozen applications.',
      ],
    },
    {
      heading: 'Normalise the question, not the field',
      paragraphs: [
        'When a human answers an unmapped question, do not store the answer against that field on that page. Store it against a normalised form of the question, so it can be matched when the same thing is asked differently elsewhere.',
        'Embedding the question text and matching by similarity works well here, because these questions are short and semantically distinctive. "When could you start?" and "What is your notice period?" are close enough to link, and far enough from anything else to avoid false matches.',
        'Set the threshold to prefer asking over assuming, and show a near match for confirmation rather than applying it. "We answered a similar question this way — is that right here?" takes one tap, and it is the difference between a library that grows accurately and one that propagates an early mistake across forty applications.',
      ],
      bullets: [
        'Store answers against a canonical question, not a field id',
        'Match new questions by meaning, with a confidence threshold',
        'Keep the original wording for review, and the answer separately',
        'Let the candidate edit their canonical answers in one place',
      ],
      table: {
        caption: 'Questions that recur, in different words',
        columns: ['Canonical question', 'Seen as', 'Answer type'],
        rows: [
          ['Notice period', '"When can you start?"', 'Duration, candidate-confirmed'],
          ['Salary expectation', '"Compensation requirements"', 'Never automated'],
          ['Relocation', '"Are you able to commute to…"', 'Stored preference'],
          ['Referral source', '"How did you hear about us?"', 'Safe default'],
          ['Right to work', '"Will you require sponsorship?"', 'Never automated'],
          ['Why this company', '"What interests you about…"', 'Human or draft only'],
        ],
      },
    },
    {
      heading: 'Multi-step flows need explicit state',
      paragraphs: [
        'Many applications span several pages, sometimes with a progress indicator, sometimes not, sometimes with a step that appears only for certain answers. An agent treating each page independently loses track of where it is.',
        'Track the flow explicitly: which step, what has been submitted, what remains. Then a crash or a session expiry can resume rather than restart — which matters because restarting a partially submitted application can create a duplicate.',
        'Record the step by what it contains rather than by its number. A flow that inserts a conditional step renumbers everything after it, and a resume that trusts "step three" will land somewhere it has already completed.',
      ],
    },
    {
      heading: 'Conditional fields will catch you out',
      paragraphs: [
        'Selecting a country reveals a state dropdown. Ticking a box reveals three more questions. A form that looked complete when you enumerated it is not complete after you fill it.',
        'Re-enumerate after every meaningful change rather than working from the initial list. This single habit eliminates the most common cause of applications submitted with required fields left empty.',
        'Validate before submitting as well as after filling. A final pass checking that every required field holds a value catches the conditional section that appeared after the agent stopped looking, and it costs one read of the form.',
      ],
    },
    {
      heading: 'Constrained inputs are their own category',
      paragraphs: [
        'Dropdowns, radio groups and typeahead fields do not accept a value — they accept one of their options. The candidate’s true answer may not be among them, and this is where an agent most reliably does something subtly wrong.',
        'Match the stored answer against the available options and require a high confidence. An exact or unambiguous match is safe; anything else is an escalation, because selecting the nearest plausible country, institution or degree type on someone’s behalf is a misstatement rather than a small approximation.',
        'Typeahead fields are the worst of these because they look like text inputs. Typing a value that the widget never resolves into a selection leaves the field visually filled and actually empty, so the result has to be read back from the widget’s state rather than from what appears on screen.',
      ],
      bullets: [
        'Enumerate the options before choosing, never type into a select',
        'Exact or unambiguous match only; otherwise escalate',
        'Read typeahead results back from state, not from the screen',
        '"Other" plus a free-text box is an escalation, not a solution',
      ],
    },
    {
      heading: 'Know when to stop',
      paragraphs: [
        'The agent should stop and ask rather than guess whenever it meets something it cannot map with confidence, an unexpected validation error it cannot resolve, a file upload of a type it does not hold, or anything resembling a declaration.',
        'Make stopping cheap and informative: show the question, the page, and what it would have answered. A well-designed escalation takes the candidate ten seconds and teaches the system something permanent, which is a far better trade than a confident wrong answer.',
        'Batch the escalations where you can. Three questions presented together at the end of an otherwise complete application is one interruption; three separate prompts spread across ten minutes is the experience that makes people stop using the tool.',
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
      a: 'With explicit flow state — which step, what was submitted, what remains — recorded by content rather than step number, so a resume does not land on a step already completed.',
    },
    {
      q: 'When should the agent stop and ask?',
      a: 'Any unmappable question, unresolved validation error, missing file type, or anything resembling a declaration. Make the escalation informative — it costs ten seconds and permanently improves the system.',
    },
    {
      q: 'What makes dropdowns and typeaheads risky?',
      a: 'They accept one of their options, not a value. Selecting the nearest plausible country or degree is a misstatement, and a typeahead that never resolved leaves a field that looks filled and is empty.',
    },
    {
      q: 'How should a near match on a stored answer be used?',
      a: 'Shown for confirmation, not applied. One tap keeps the answer library accurate; silent reuse propagates an early mistake across every later application.',
    },
  ],
  related: ['how-to-build-a-universal-ats-automation-agent', 'how-to-build-an-ai-agent-that-fills-job-forms', 'how-to-build-reliable-browser-automation'],
};

export default post;

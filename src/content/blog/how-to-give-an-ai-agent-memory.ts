import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-give-an-ai-agent-memory',
  tint: 'indigo',
  title: 'How to Give an AI Agent Memory for Your Job Search',
  heading: 'Memory for a job search agent',
  description:
    'What an agent should remember, what it should not, structured facts versus retrieved history, handling contradictions, and letting the user correct it.',
  keywords: [
    'ai agent memory',
    'agent long term memory',
    'structured agent memory',
    'memory vs context window',
    'agent preference learning',
    'memory contradiction',
    'editable agent memory',
    'job search agent memory',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Memory is not a bigger context window. It is deciding what is worth keeping, and being willing to throw the rest away.',
  sections: [
    {
      heading: 'Memory is a filtering problem',
      paragraphs: [
        'The instinct is to store everything and retrieve what seems relevant. That degrades steadily: the store fills with noise, retrieval surfaces things that merely resemble the question, and the agent starts acting on a stray remark from a fortnight ago.',
        'Better to decide deliberately what is worth remembering. For a job search that is a short list — what the person wants, what they have ruled out, what has already been done — and most of the conversation is not on it.',
      ],
    },
    {
      heading: 'Prefer structured facts to remembered text',
      paragraphs: [
        'Storing "the user said they prefer remote roles" as text means re-interpreting that sentence every time. Storing a preference field with a value, a source and a timestamp means the system can act on it directly and show it to the user.',
        'Structure also lets you handle change properly. A preference with a timestamp can be superseded; a paragraph in a vector store cannot, and will keep being retrieved long after it stopped being true.',
      ],
      bullets: [
        'Stated preferences: value, source, timestamp, confidence',
        'Exclusions: employers or roles ruled out, with the reason',
        'History: applications sent and their outcomes',
        'Observations: inferred patterns, marked clearly as inferred',
      ],
    },
    {
      heading: 'Separate what was said from what was inferred',
      paragraphs: [
        'An agent that treats its own inference as fact becomes confidently wrong in ways the user cannot correct. "You prefer startups" derived from two clicks is a guess, and presenting it as something the user said is how trust breaks.',
        'Keep the provenance and weight accordingly. Explicit statements outrank inferences; recent statements outrank old ones; and an inference that contradicts a statement should be discarded rather than averaged.',
      ],
    },
    {
      heading: 'Contradictions need a rule, not an average',
      paragraphs: [
        'People change their minds — that is the normal case in a job search, not an anomaly. Someone who wanted senior backend roles in March may want engineering management by June, and a memory that blends both serves neither.',
        'Apply recency explicitly: the newer statement wins, the older one is retained as history rather than as an active preference. And when two current statements genuinely conflict, ask, because guessing which one the user meant is exactly the kind of silent error that produces bad applications.',
      ],
    },
    {
      heading: 'Let the user see and edit it',
      paragraphs: [
        'Memory the user cannot inspect is memory they cannot correct, and a wrong preference silently steering a job search is worse than no memory at all.',
        'Show what the agent believes and make every item editable and deletable. This is a product feature and a debugging tool at once: most reports of an agent behaving strangely resolve to one wrong remembered fact, visible in a second on a screen that shows it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is agent memory just a bigger context window?',
      a: 'No. Memory is deciding what is worth keeping. Storing everything and retrieving by similarity degrades — the agent ends up acting on a stray remark from a fortnight ago.',
    },
    {
      q: 'Should memories be stored as text or as structured fields?',
      a: 'Structured, with value, source and timestamp. Text has to be re-interpreted each time and cannot be superseded, so it keeps being retrieved long after it stopped being true.',
    },
    {
      q: 'How should an agent handle changed preferences?',
      a: 'By an explicit recency rule: the newer statement wins and the older is kept as history. When two current statements genuinely conflict, ask rather than average them.',
    },
    {
      q: 'Should users be able to edit agent memory?',
      a: 'Yes. Memory they cannot inspect is memory they cannot correct, and most reports of strange agent behaviour resolve to a single wrong remembered fact.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-build-a-long-running-ai-agent', 'how-to-build-an-ai-agent-that-improves-over-time'],
};

export default post;

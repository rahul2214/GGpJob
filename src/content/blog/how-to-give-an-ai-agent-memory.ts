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
  anchors: ['agent memory', 'structured facts'],
  excerpt:
    'Memory is not a bigger context window. It is deciding what is worth keeping, and being willing to throw the rest away.',
  keyTakeaways: [
    'Storing everything and retrieving by similarity degrades into acting on stray remarks.',
    'Structured facts with a timestamp can be superseded; remembered text cannot.',
    'Keep provenance: explicit statements outrank inferences, and recent outranks old.',
    'Contradictions need an explicit rule, because people changing their minds is the normal case.',
    'Memory the user cannot inspect is memory they cannot correct.',
  ],
  sections: [
    {
      heading: 'Memory is a filtering problem',
      paragraphs: [
        'The instinct is to store everything and retrieve what seems relevant. That degrades steadily: the store fills with noise, retrieval surfaces things that merely resemble the question, and the agent starts acting on a stray remark from a fortnight ago.',
        'Better to decide deliberately what is worth remembering. For a job search that is a short list — what the person wants, what they have ruled out, what has already been done — and most of the conversation is not on it.',
        'Being deliberate about promotion is most of the design. A correction the candidate made, a constraint they stated, a category they rejected twice — those belong in fields that persist; the rest is history nobody needs to reread.',
      ],
    },
    {
      heading: 'Prefer structured facts to remembered text',
      paragraphs: [
        'Storing "the user said they prefer remote roles" as text means re-interpreting that sentence every time. Storing a preference field with a value, a source and a timestamp means the system can act on it directly and show it to the user.',
        'Structure also lets you handle change properly. A preference with a timestamp can be superseded; a paragraph in a vector store cannot, and will keep being retrieved long after it stopped being true.',
        'It keeps the context small, which is the other half of why this matters. An agent running for three weeks cannot carry three weeks of conversation, and rebuilding a compact working context from structured state each cycle is what makes a long-running agent possible at all.',
      ],
      bullets: [
        'Stated preferences: value, source, timestamp, confidence',
        'Exclusions: employers or roles ruled out, with the reason',
        'History: applications sent and their outcomes',
        'Observations: inferred patterns, marked clearly as inferred',
      ],
      table: {
        caption: 'What to keep, and what to let go',
        columns: ['Item', 'Keep', 'Why'],
        rows: [
          ['Stated target role', 'Long-lived', 'Authoritative until changed'],
          ['Hard constraints', 'Long-lived', 'Checked, not weighed'],
          ['Employers excluded', 'Permanent', 'Nothing should reintroduce them'],
          ['Applications and outcomes', 'Permanent', 'The only real feedback'],
          ['Inferred tendencies', 'Decayed', 'A guess with a shelf life'],
          ['Conversation transcript', 'A log, not memory', 'Retrieval surfaces noise'],
        ],
      },
    },
    {
      heading: 'Separate what was said from what was inferred',
      paragraphs: [
        'An agent that treats its own inference as fact becomes confidently wrong in ways the user cannot correct. "You prefer startups" derived from two clicks is a guess, and presenting it as something the user said is how trust breaks.',
        'Keep the provenance and weight accordingly. Explicit statements outrank inferences; recent statements outrank old ones; and an inference that contradicts a statement should be discarded rather than averaged.',
        'Keep hard constraints out of the weighted layer entirely. A location the candidate ruled out or a salary floor they stated is a rule to check, and merging it into a preference score is how an explicit exclusion ends up outvoted by a run of clicks.',
      ],
    },
    {
      heading: 'Contradictions need a rule, not an average',
      paragraphs: [
        'People change their minds — that is the normal case in a job search, not an anomaly. Someone who wanted senior backend roles in March may want engineering management by June, and a memory that blends both serves neither.',
        'Apply recency explicitly: the newer statement wins, the older one is retained as history rather than as an active preference. And when two current statements genuinely conflict, ask, because guessing which one the user meant is exactly the kind of silent error that produces bad applications.',
        'Watch for the discontinuities that should reset rather than decay. A changed target, a new constraint or a long gap in activity all suggest the accumulated model describes a previous search, and averaging across the break produces a feed that serves neither version of the person.',
      ],
    },
    {
      heading: 'Memory here is sensitive data',
      paragraphs: [
        'This store holds what someone wants to leave their job for, which employers they will not work with, and why. Most users are searching while employed, and the consequence of that reaching the wrong place is their current job rather than embarrassment.',
        'So it needs the same treatment as the rest of the candidate record: scoped in the data layer to a verified identity, encrypted at rest, with a retention limit and a deletion path that actually removes it.',
        'Be careful what memory leaks into outputs. A cover letter that mentions the candidate is unhappy in their current role, or an exclusion reason surfacing in something an employer sees, is a disclosure the agent made on their behalf — so the generation path should read only the fields it needs rather than the whole store.',
      ],
    },
    {
      heading: 'Let the user see and edit it',
      paragraphs: [
        'Memory the user cannot inspect is memory they cannot correct, and a wrong preference silently steering a job search is worse than no memory at all.',
        'Show what the agent believes and make every item editable and deletable. This is a product feature and a debugging tool at once: most reports of an agent behaving strangely resolve to one wrong remembered fact, visible in a second on a screen that shows it.',
        'Write it in the user’s language rather than the system’s. "You seem to prefer smaller companies and are not interested in management roles" is correctable; a list of weighted fields is the same information and useless as an interface.',
        'Offer a granular reset. Clearing learned tendencies while keeping application history and stated constraints is usually what someone wants, and an all-or-nothing option means they either keep a broken model or lose the record of their own search.',
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
      a: 'Yes, in plain language, with a granular reset. Most reports of strange agent behaviour resolve to a single wrong remembered fact.',
    },
    {
      q: 'Should constraints live in the same layer as preferences?',
      a: 'No. Constraints are checked; preferences are weighted. Merging them lets an explicit exclusion be outvoted by a run of clicks.',
    },
    {
      q: 'Is agent memory sensitive data?',
      a: 'Very. It holds why someone wants to leave their job and which employers they refuse, for a user usually searching while employed — so scoping, encryption and real deletion apply.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-build-a-long-running-ai-agent', 'how-to-build-an-ai-agent-that-improves-over-time'],
};

export default post;

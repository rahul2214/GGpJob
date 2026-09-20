import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'the-complete-architecture-of-an-ai-job-application-platform',
  tint: 'violet',
  title: 'The Complete Architecture of an AI Job Application Platform',
  heading: 'The whole system, in layers',
  description:
    'A reference architecture: data model, ingestion, matching, generation, agent execution, security boundaries, and the decisions that are hard to reverse later.',
  keywords: [
    'ai job platform architecture',
    'system design job board',
    'matching architecture',
    'agent execution layer',
    'platform security boundaries',
    'reference architecture ai',
    'job application platform',
    'system layers design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['platform architecture', 'hard to reverse'],
  excerpt:
    'Most of these decisions are reversible. The three that are not are worth identifying before you start.',
  keyTakeaways: [
    'A platform whose canonical record is a PDF cannot match, tailor or explain anything well.',
    'Normalise at the boundary, keep the raw payload, deduplicate on identity.',
    'Layer matching by cost and keep eligibility as a gate rather than a weight.',
    'Agent runs are durable processes outside the request, isolated from untrusted reading.',
    'Three decisions are expensive to reverse; everything else belongs behind an adapter.',
  ],
  sections: [
    {
      heading: 'The data model is the foundation',
      paragraphs: [
        'Everything rests on structured representations of candidates and postings. Roles, achievements with metrics, skills with evidence on one side; requirements split into hard and preferred, eligibility, compensation on the other.',
        'Store documents as outputs rather than as sources of truth. A platform whose canonical candidate record is a PDF cannot match, tailor or explain anything well, and changing that later means migrating every user.',
        'Two things the documents never contain belong in the model explicitly: constraints and intent. Nothing in a CV says someone cannot relocate, needs sponsorship or is leaving the field it describes, and those determine whether a recommendation is any good.',
        'Keep provenance on every field — stated, parsed or inferred. It is what lets a stated value outrank a guess, and what stops a re-parse silently overwriting a correction the candidate made.',
      ],
    },
    {
      heading: 'Ingestion normalises the mess',
      paragraphs: [
        'Postings arrive from APIs, feeds, employer forms and partner integrations, each with its own shape. Normalise at the boundary into your schema, keep the raw payload, and record the source and fetch time on every record.',
        'Deduplicate on employer and role rather than URL, and treat freshness as a field you maintain rather than a property you assume. Stale listings are the fastest way to lose candidate trust.',
        'Alert on shape rather than only on errors. A source that starts returning an empty list, or a field that quietly becomes null, reports success while ingesting nothing — and volume deviating from a source’s own baseline catches that days before a user does.',
      ],
      bullets: [
        'Adapters per source, normalising into one schema',
        'Raw payload retained for reprocessing',
        'Deduplication on identity; canonical record preferred',
        'Freshness tracked and surfaced, not assumed',
      ],
      table: {
        caption: 'The layers, and what each one owns',
        columns: ['Layer', 'Owns', 'Never does'],
        rows: [
          ['Data model', 'Facts, provenance, constraints', 'Store documents as truth'],
          ['Ingestion', 'Normalisation, dedup, freshness', 'Let source shapes leak inward'],
          ['Matching', 'Filters, retrieval, scoring', 'Weigh eligibility'],
          ['Generation', 'Documents and answers', 'Write a date or a figure'],
          ['Agent execution', 'Long runs, state, idempotency', 'Live inside a web request'],
          ['Security', 'Identity, scoping, approval', 'Rely on a prompt'],
        ],
      },
    },
    {
      heading: 'Matching is layered by cost',
      paragraphs: [
        'Hard filters run first because they are binary and free. Vector retrieval narrows to a plausible set. Model reasoning runs on the shortlist only, producing per-requirement outcomes rather than a single opaque number.',
        'Keep eligibility out of the scoring entirely. As a weight it can be outweighed; as a gate it cannot, and that distinction prevents the worst class of recommendation.',
        'Measure retrieval and ranking separately, because a role that never reached the shortlist cannot be rescued by a better ranker. The two failures are indistinguishable in one end-to-end number and need entirely different work.',
      ],
    },
    {
      heading: 'Generation runs from structured data and is verified',
      paragraphs: [
        'Documents, letters and free-text answers are generated from the structured profile, with a verification pass that rejects any claim without supporting evidence. Unverified output never reaches an application.',
        'Store every generated document against its application permanently. The candidate will be interviewed against one specific version, and it is also the only record of what the system actually produced.',
        'Never let the model write a fact. Dates, titles, employers and figures are copied from the record, which is a stronger guarantee than any instruction — and the verification pass then only has to police strength, where "contributed to" becoming "led" is the failure a content check approves.',
      ],
    },
    {
      heading: 'Agent execution lives outside the request',
      paragraphs: [
        'Agent runs are durable processes in workers, with state persisted after each step and every outward action idempotent. Web requests start and monitor them; they never contain them.',
        'The critical structural rule is isolation: the component that reads untrusted content — job descriptions, web pages — must not be the component holding the ability to submit. Prompt instructions do not substitute for that separation.',
        'Cap what accumulates, in code. Applications per day, per employer and per week, spend per run, steps per application — all surviving a restart, because a bug that runs for six hours should produce a contained mess rather than an unbounded one.',
        'Idempotency keyed on candidate, employer and normalised role is what makes retries safe. Keying on the posting URL produces four keys for one role arriving through four sources, which defeats the whole mechanism.',
      ],
    },
    {
      heading: 'Security boundaries, stated plainly',
      paragraphs: [
        'Identity is resolved server-side from the session; anything the client says about who it is, is a claim. Every query is scoped in the data layer, so a reasoning error cannot become a data leak. Provider keys never leave the server. Irreversible actions require explicit confirmation tied to the user.',
        'These are not features to add later. Each one is either designed in or retrofitted through the whole system, and the retrofit is always more expensive than it looks.',
        'One threat is specific to this domain and easy to omit: the candidate’s current employer. Most users search while employed, and a notification, an email or a visible profile change reaching the wrong place is a real harm with no attacker involved.',
        'Auditability belongs here too, for three reasons of which only one is security. A candidate will ask what was sent in their name, an employer may query a submission, and a screening decision may have to be explained months later.',
      ],
    },
    {
      heading: 'The decisions that are hard to reverse',
      paragraphs: [
        'Three choices are expensive to change: the structured data model, because everything reads it; the slug and identifier scheme for public URLs, because they are indexed; and where the trust boundary sits between reading untrusted content and taking action.',
        'Almost everything else — models, providers, vector store, framework — can be swapped behind an adapter. Spend the early design effort on the three that cannot, and keep the rest replaceable.',
        'Embedding model and chunking strategy sit just behind those three. They are changeable, and only if every vector carries its model and chunking version and the active generation is enforced in the query — otherwise the choice is a big-bang re-embed or never improving.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should the canonical candidate record be?',
      a: 'Structured data — roles, achievements with metrics, skills with evidence, plus constraints and intent, which no document contains. A PDF as source of truth cannot support matching or tailoring.',
    },
    {
      q: 'How should matching be structured?',
      a: 'Layered by cost: hard filters, then vector retrieval, then model reasoning on the shortlist producing per-requirement outcomes. Eligibility stays a gate, never a weight.',
    },
    {
      q: 'Where do agent runs execute?',
      a: 'In durable workers outside the request, with state persisted per step, idempotency keyed on candidate and role, and the reading component isolated from the one that can submit.',
    },
    {
      q: 'Which architectural decisions are hard to reverse?',
      a: 'The structured data model, the public URL and identifier scheme, and where the trust boundary sits. Models, providers and frameworks can all be swapped behind an adapter.',
    },
    {
      q: 'What should ingestion alert on?',
      a: 'Shape, not just errors. A source returning an empty list reports success while ingesting nothing, and volume deviating from its own baseline catches that days early.',
    },
    {
      q: 'Which threat is most often left out of the model?',
      a: 'The candidate current employer. Most users search while employed, and a notification reaching the wrong place is a real harm with no attacker involved.',
    },
  ],
  related: ['building-an-end-to-end-autonomous-job-search-system', 'how-to-build-a-secure-ai-job-application-platform', 'how-to-build-a-multi-agent-recruitment-platform'],
};

export default post;

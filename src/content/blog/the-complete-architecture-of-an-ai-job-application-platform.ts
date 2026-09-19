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
  excerpt:
    'Most of these decisions are reversible. The three that are not are worth identifying before you start.',
  sections: [
    {
      heading: 'The data model is the foundation',
      paragraphs: [
        'Everything rests on structured representations of candidates and postings. Roles, achievements with metrics, skills with evidence on one side; requirements split into hard and preferred, eligibility, compensation on the other.',
        'Store documents as outputs rather than as sources of truth. A platform whose canonical candidate record is a PDF cannot match, tailor or explain anything well, and changing that later means migrating every user.',
      ],
    },
    {
      heading: 'Ingestion normalises the mess',
      paragraphs: [
        'Postings arrive from APIs, feeds, employer forms and partner integrations, each with its own shape. Normalise at the boundary into your schema, keep the raw payload, and record the source and fetch time on every record.',
        'Deduplicate on employer and role rather than URL, and treat freshness as a field you maintain rather than a property you assume. Stale listings are the fastest way to lose candidate trust.',
      ],
      bullets: [
        'Adapters per source, normalising into one schema',
        'Raw payload retained for reprocessing',
        'Deduplication on identity; canonical record preferred',
        'Freshness tracked and surfaced, not assumed',
      ],
    },
    {
      heading: 'Matching is layered by cost',
      paragraphs: [
        'Hard filters run first because they are binary and free. Vector retrieval narrows to a plausible set. Model reasoning runs on the shortlist only, producing per-requirement outcomes rather than a single opaque number.',
        'Keep eligibility out of the scoring entirely. As a weight it can be outweighed; as a gate it cannot, and that distinction prevents the worst class of recommendation.',
      ],
    },
    {
      heading: 'Generation runs from structured data and is verified',
      paragraphs: [
        'Documents, letters and free-text answers are generated from the structured profile, with a verification pass that rejects any claim without supporting evidence. Unverified output never reaches an application.',
        'Store every generated document against its application permanently. The candidate will be interviewed against one specific version, and it is also the only record of what the system actually produced.',
      ],
    },
    {
      heading: 'Agent execution lives outside the request',
      paragraphs: [
        'Agent runs are durable processes in workers, with state persisted after each step and every outward action idempotent. Web requests start and monitor them; they never contain them.',
        'The critical structural rule is isolation: the component that reads untrusted content — job descriptions, web pages — must not be the component holding the ability to submit. Prompt instructions do not substitute for that separation.',
      ],
    },
    {
      heading: 'Security boundaries, stated plainly',
      paragraphs: [
        'Identity is resolved server-side from the session; anything the client says about who it is, is a claim. Every query is scoped in the data layer, so a reasoning error cannot become a data leak. Provider keys never leave the server. Irreversible actions require explicit confirmation tied to the user.',
        'These are not features to add later. Each one is either designed in or retrofitted through the whole system, and the retrofit is always more expensive than it looks.',
      ],
    },
    {
      heading: 'The decisions that are hard to reverse',
      paragraphs: [
        'Three choices are expensive to change: the structured data model, because everything reads it; the slug and identifier scheme for public URLs, because they are indexed; and where the trust boundary sits between reading untrusted content and taking action.',
        'Almost everything else — models, providers, vector store, framework — can be swapped behind an adapter. Spend the early design effort on the three that cannot, and keep the rest replaceable.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should the canonical candidate record be?',
      a: 'Structured data — roles, achievements with metrics, skills with evidence. A platform whose source of truth is a PDF cannot match, tailor or explain anything well.',
    },
    {
      q: 'How should matching be structured?',
      a: 'Layered by cost: hard filters, then vector retrieval, then model reasoning on the shortlist producing per-requirement outcomes. Eligibility stays a gate, never a weight.',
    },
    {
      q: 'Where do agent runs execute?',
      a: 'In durable workers outside the request, with state persisted per step and idempotent actions — and with the component reading untrusted content isolated from the one that can submit.',
    },
    {
      q: 'Which architectural decisions are hard to reverse?',
      a: 'The structured data model, the public URL and identifier scheme, and where the trust boundary sits. Models, providers and frameworks can all be swapped behind an adapter.',
    },
  ],
  related: ['building-an-end-to-end-autonomous-job-search-system', 'how-to-build-a-secure-ai-job-application-platform', 'how-to-build-a-multi-agent-recruitment-platform'],
};

export default post;

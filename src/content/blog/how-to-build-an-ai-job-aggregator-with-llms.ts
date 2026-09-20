import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-aggregator-with-llms',
  tint: 'indigo',
  title: 'How to Build an AI Job Aggregator With LLMs',
  heading: 'Where a model belongs in an aggregator',
  description:
    'Using models for the parts of aggregation that resist rules — extraction, classification, deduplication judgement — while keeping the pipeline cheap and deterministic.',
  keywords: [
    'ai job aggregator',
    'llm data extraction',
    'job listing normalisation',
    'llm classification pipeline',
    'aggregator cost control',
    'structured extraction',
    'spam listing detection',
    'job data pipeline',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job aggregator', 'rules first'],
  excerpt:
    'Running a model over every listing is the obvious design and the wrong one. Most listings do not need it.',
  keyTakeaways: [
    'A well-formed feed needs a mapping, not interpretation.',
    'Extraction is the strongest use, provided it is grounded — an unstated salary stays empty.',
    'Classification catches the listings that damage trust faster than any ranking problem.',
    'Block cheaply before judging pairs, or deduplication becomes quadratic and unaffordable.',
    'Re-processing unchanged listings is the largest avoidable cost in the whole system.',
  ],
  sections: [
    {
      heading: 'Rules first, model second',
      paragraphs: [
        'Much of an aggregator is deterministic: a well-formed feed with structured fields does not need interpretation. Sending it to a model anyway is paying for something a mapping already did correctly.',
        'Apply the model where rules fail — free-text descriptions, inconsistent salary phrasing, unlabelled seniority, employment type expressed in prose. Route by whether the deterministic path produced a confident result.',
        'Make the routing decision explicit and measurable. Tracking what proportion of each source takes the expensive path tells you where a better mapping would pay for itself, and it is the number that keeps a pipeline from quietly drifting towards sending everything to a model.',
      ],
    },
    {
      heading: 'Extraction is the strongest use',
      paragraphs: [
        'Pulling structured fields out of prose is what models are unambiguously good at: requirements, seniority, salary, employment type, remote policy — none of which arrive in a usable form from most sources.',
        'Constrain the output to a schema so every result is the right shape. And require extractions to be grounded: if the posting does not state a salary, the field is empty rather than estimated, because a plausible invented figure in a job listing is a serious defect.',
        'Distinguish absent from unknown in the schema itself. A posting with no salary and a posting whose salary the extractor could not parse are different facts, and collapsing them means you cannot tell a coverage problem from a parsing one.',
      ],
      bullets: [
        'Requirements, separated into hard and preferred',
        'Seniority band, only when the text supports one',
        'Salary with currency and period, or nothing',
        'Remote policy, distinguishing remote from hybrid from on-site',
        'Absent and unparseable as distinct outcomes',
      ],
      table: {
        caption: 'Which path each field takes',
        columns: ['Field', 'Path', 'Note'],
        rows: [
          ['Title and employer', 'Mapping', 'Usually structured at source'],
          ['Posted date', 'Mapping', 'Beware re-syndication dates'],
          ['Salary', 'Mapping, else model', 'Never estimate'],
          ['Requirements', 'Model', 'Prose by nature'],
          ['Seniority', 'Model', 'Rarely labelled'],
          ['Remote policy', 'Model', 'Often contradicts the location field'],
          ['Is this a real job', 'Classifier', 'Run on every listing'],
        ],
      },
    },
    {
      heading: 'Classification catches what harms users',
      paragraphs: [
        'Aggregated feeds carry listings that are not really jobs: CV-collection exercises, multi-level marketing recruitment, roles that are actually unpaid, and outright scams. These damage trust faster than any ranking problem.',
        'A classification pass identifies most of them from the text. Run it on ingestion, hold anything suspicious for review rather than publishing it, and treat a false negative here as a more serious defect than a false positive.',
        'The strongest fraud signals are specific enough to encode directly rather than weigh: a request for payment, a demand for bank or identity documents before any interview, contact moved immediately to a consumer messaging app. Each of those justifies holding a listing on its own.',
        'Give review a real path, because an aggressive threshold is only acceptable if a legitimate employer caught by it can reach a person quickly. Without that the classifier is not a safety measure but an arbitrary exclusion.',
      ],
    },
    {
      heading: 'Use the model to judge, not to compare everything',
      paragraphs: [
        'Deduplication across sources needs judgement — is this the same role at the same employer, or two similar openings? — but comparing every pair with a model is quadratic and unaffordable.',
        'Block candidates cheaply with normalised employer, title and location, then use the model only on the small set of ambiguous pairs that blocking produced. That is affordable and more accurate than a similarity threshold alone.',
        'Agency listings are the case that defeats naive blocking. The same role appears under three recruitment firms with the employer’s name deliberately removed, so the blocking key has to fall back to description similarity when the employer field is missing rather than treating each as a distinct company.',
      ],
    },
    {
      heading: 'Cache, batch and cap',
      paragraphs: [
        'Listings are stable once published, so extraction results should be computed once and cached against the content hash. Re-processing unchanged listings is the largest avoidable cost in an aggregator.',
        'Batch ingestion rather than processing per request, cap spend per ingestion run, and make sure a source that suddenly returns ten times as many listings cannot quietly consume the budget for everything else.',
        'Version the cache key by the extraction schema and model as well as the content. Otherwise an improved extractor silently keeps serving the old results, and a partially re-processed corpus is worse than either version applied consistently.',
        'Alert on the shape of a run rather than only on errors. A source whose volume drops to a tenth, or whose extraction failure rate triples, has usually changed its format — and that arrives days before anyone reports missing jobs.',
      ],
      bullets: [
        'Cache keyed by content hash plus schema and model version',
        'Per-source and per-run spend caps, enforced before the call',
        'Alerts on volume and failure-rate changes, not just exceptions',
        'A circuit breaker per source, so one bad feed cannot drain the budget',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should every listing go through a model?',
      a: 'No. Well-formed feeds with structured fields need a mapping, not interpretation. Route to the model only where the deterministic path fails to produce a confident result.',
    },
    {
      q: 'What are models best at in an aggregator?',
      a: 'Extracting structured fields from prose — requirements, seniority, salary, remote policy — constrained to a schema and grounded, so an unstated salary stays empty rather than estimated.',
    },
    {
      q: 'Can models help with deduplication?',
      a: 'For judgement on ambiguous pairs, yes. Block candidates cheaply by employer, title and location first — comparing every pair with a model is quadratic and unaffordable.',
    },
    {
      q: 'What is the biggest avoidable cost?',
      a: 'Re-processing unchanged listings. Cache extraction results against the content hash plus the schema and model version, batch ingestion, and cap spend per run.',
    },
    {
      q: 'Why distinguish absent from unparseable?',
      a: 'Because they are different facts. Collapsing them means you cannot tell a source with no salary data from an extractor that stopped parsing it.',
    },
    {
      q: 'How aggressive should fraud classification be?',
      a: 'Aggressive, provided review is real. Holding a legitimate listing costs a day; publishing one scam costs a candidate considerably more.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites', 'how-to-detect-duplicate-job-listings', 'how-to-build-an-ai-job-description-parser'],
};

export default post;

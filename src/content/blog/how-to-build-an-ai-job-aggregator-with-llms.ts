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
  excerpt:
    'Running a model over every listing is the obvious design and the wrong one. Most listings do not need it.',
  sections: [
    {
      heading: 'Rules first, model second',
      paragraphs: [
        'Much of an aggregator is deterministic: a well-formed feed with structured fields does not need interpretation. Sending it to a model anyway is paying for something a mapping already did correctly.',
        'Apply the model where rules fail — free-text descriptions, inconsistent salary phrasing, unlabelled seniority, employment type expressed in prose. Route by whether the deterministic path produced a confident result.',
      ],
    },
    {
      heading: 'Extraction is the strongest use',
      paragraphs: [
        'Pulling structured fields out of prose is what models are unambiguously good at: requirements, seniority, salary, employment type, remote policy — none of which arrive in a usable form from most sources.',
        'Constrain the output to a schema so every result is the right shape. And require extractions to be grounded: if the posting does not state a salary, the field is empty rather than estimated, because a plausible invented figure in a job listing is a serious defect.',
      ],
      bullets: [
        'Requirements, separated into hard and preferred',
        'Seniority band, only when the text supports one',
        'Salary with currency and period, or nothing',
        'Remote policy, distinguishing remote from hybrid from on-site',
      ],
    },
    {
      heading: 'Classification catches what harms users',
      paragraphs: [
        'Aggregated feeds carry listings that are not really jobs: CV-collection exercises, multi-level marketing recruitment, roles that are actually unpaid, and outright scams. These damage trust faster than any ranking problem.',
        'A classification pass identifies most of them from the text. Run it on ingestion, hold anything suspicious for review rather than publishing it, and treat a false negative here as a more serious defect than a false positive.',
      ],
    },
    {
      heading: 'Use the model to judge, not to compare everything',
      paragraphs: [
        'Deduplication across sources needs judgement — is this the same role at the same employer, or two similar openings? — but comparing every pair with a model is quadratic and unaffordable.',
        'Block candidates cheaply with normalised employer, title and location, then use the model only on the small set of ambiguous pairs that blocking produced. That is affordable and more accurate than a similarity threshold alone.',
      ],
    },
    {
      heading: 'Cache, batch and cap',
      paragraphs: [
        'Listings are stable once published, so extraction results should be computed once and cached against the content hash. Re-processing unchanged listings is the largest avoidable cost in an aggregator.',
        'Batch ingestion rather than processing per request, cap spend per ingestion run, and make sure a source that suddenly returns ten times as many listings cannot quietly consume the budget for everything else.',
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
      a: 'Re-processing unchanged listings. Cache extraction results against the content hash, batch ingestion, and cap spend per run.',
    },
  ],
  related: ['how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites', 'how-to-detect-duplicate-job-listings', 'how-to-build-an-ai-job-description-parser'],
};

export default post;

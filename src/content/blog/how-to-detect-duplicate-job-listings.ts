import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-detect-duplicate-job-listings',
  tint: 'violet',
  title: 'How to Detect Duplicate Job Listings Using AI',
  heading: 'Detecting duplicate job listings',
  description:
    'Why the same role appears many times across sources, why exact matching fails, and a layered approach that catches duplicates without merging distinct roles.',
  keywords: [
    'detect duplicate job listings',
    'job deduplication',
    'duplicate jobs ai',
    'job posting dedupe',
    'embedding deduplication',
    'job data quality',
    'near duplicate detection',
    'job aggregator dedupe',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['duplicate job listings', 'false merge'],
  excerpt:
    'Two postings for the same job rarely share a single identical field. Two postings for genuinely different jobs often share almost all of them.',
  keyTakeaways: [
    'Duplicates are the default state of aggregated job data, not an edge case.',
    'Exact matching catches almost nothing and merges genuinely different roles.',
    'A cascade, cheapest first, keeps the expensive layer proportional to the hard cases.',
    'A false merge hides a real job; a false split shows a duplicate. Choose accordingly.',
    'Group rather than delete, and merge the richest value per field.',
  ],
  sections: [
    {
      heading: 'Why duplicates are the default',
      paragraphs: [
        'One opening is posted to the employer’s careers page, syndicated to several boards, reposted by two agencies with the company name removed, and refreshed a fortnight later with a slightly different title. Every one of those is a separate record arriving in your pipeline.',
        'Left unhandled this is not cosmetic. It skews your matching, wastes tokens scoring the same role repeatedly, and in an applying system risks sending several applications to one employer — which is the worst outcome the system can produce.',
        'The duplicate application is the one that reaches a person. Internal inefficiency is invisible to a candidate; two applications to the same role arriving in one recruiter’s queue is visible, attributed to the candidate, and remembered.',
      ],
    },
    {
      heading: 'Why exact matching fails',
      paragraphs: [
        'Title and company seems obvious and catches almost nothing. "Senior Software Engineer" and "Software Engineer III" are the same role; "Acme Ltd" and "Acme Technologies Limited" are the same employer; an agency posting has neither.',
        'The mirror problem is worse. Two genuinely different openings at the same company — same title, same location, different teams — match on every field you would compare. Merging those loses a real opportunity, which is a quieter failure than showing a duplicate and a more expensive one.',
        'Reposts add a temporal dimension nobody expects. The same role advertised again three months later may be a genuine second opening or the first one re-listed, and the only distinguishing evidence is often whether the original ever closed.',
      ],
    },
    {
      heading: 'A layered approach',
      paragraphs: [
        'No single technique works. What works is a cascade, cheapest first, escalating only for the genuinely ambiguous pairs — which keeps the cost of the expensive layer proportional to the hard cases rather than to the corpus.',
        'The ordering matters as much as the techniques: each layer should either decide confidently or pass the pair along, never guess to avoid the next layer.',
        'Blocking is what makes the whole thing affordable. Comparing every pair is quadratic and unaffordable at any real volume, so normalised employer, title and location should narrow the candidate set to a handful before anything expensive runs.',
      ],
      bullets: [
        'Normalise first — company suffixes, title conventions, whitespace',
        'Exact match on a canonical key where the source gives a stable job id',
        'Fingerprint the description — hashing shingles catches verbatim reposts',
        'Embed and compare — catches rewrites that exact methods miss',
        'Model adjudication on the remaining ambiguous pairs only',
      ],
      table: {
        caption: 'Each layer, and what it catches',
        columns: ['Layer', 'Cost', 'Catches', 'Misses'],
        rows: [
          ['Normalisation', 'Negligible', 'Formatting variants', 'Everything else'],
          ['Stable job id', 'Negligible', 'Same-source reposts', 'Cross-source copies'],
          ['Description fingerprint', 'Very low', 'Verbatim syndication', 'Reworded copies'],
          ['Embedding similarity', 'Low', 'Rewrites and paraphrase', 'Two similar real roles'],
          ['Model adjudication', 'High per pair', 'The genuinely ambiguous', 'Nothing, but only run on few'],
        ],
      },
    },
    {
      heading: 'Setting the threshold honestly',
      paragraphs: [
        'Embedding similarity gives you a number and you must choose a cut-off. The instinct is to pick one that maximises accuracy on a sample, which hides an asymmetry: the two error types are not equally bad.',
        'A false merge loses a real job the candidate never sees. A false split shows a duplicate, which is mildly annoying. So the threshold should be deliberately conservative — prefer showing a duplicate to hiding an opportunity — and that is a product decision, not a tuning exercise.',
        'Tighten it only in the applying path. A conservative threshold that occasionally shows a duplicate in a feed is fine; the same threshold deciding whether to submit a second application is not, so the submission check should use employer-level deduplication as well as role-level.',
      ],
    },
    {
      heading: 'The agency case, and other hard ones',
      paragraphs: [
        'Agency postings are the systematic failure. The same role appears under three recruitment firms with the employer’s name deliberately removed, so the field you were blocking on is blank and the descriptions have been rewritten to obscure the source.',
        'The workable fallback is matching on the description’s distinctive content — a specific technology stack, an unusual responsibility, a named product — rather than on the employer field. It is less reliable, and it is the only signal present.',
        'Multi-role listings need their own handling. A posting advertising three levels of the same job is not a duplicate of anything, and collapsing it or splitting it silently both produce records that do not correspond to a real opening.',
        'Translations are the last common case. The same role posted in two languages shares almost no tokens and embeds to a similar region, which is exactly the situation where a lexical layer says no and a semantic one says yes — so route it to adjudication rather than letting either decide alone.',
      ],
    },
    {
      heading: 'Keep the group, not the winner',
      paragraphs: [
        'When you decide two records are the same role, do not discard one. Store a group with all member postings, and pick a canonical representative for display.',
        'This matters because different sources carry different information: one has the salary, another the full description, a third the direct application link. Merging by keeping the richest value per field gives a better record than any single source provided — and if your grouping turns out to be wrong, nothing has been lost.',
        'Prefer the employer’s own posting as the canonical one. It is the most likely to be current, it accepts the application directly, and it avoids routing a candidate through an agency intermediary they did not choose.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why does exact matching fail for job duplicates?',
      a: 'Because the same role is posted with different titles, company name variants, and sometimes anonymised by agencies. Meanwhile genuinely different roles at one company can match on every field you would compare.',
    },
    {
      q: 'What is the best way to detect duplicate job postings?',
      a: 'A cascade: block cheaply, normalise, exact-match on stable ids, fingerprint descriptions, embed and compare, and only send the remaining ambiguous pairs to a model.',
    },
    {
      q: 'How should I choose the similarity threshold?',
      a: 'Conservatively for display, and tighter for submission. A false merge hides a real job; a false split just shows a duplicate, and those costs are not equal.',
    },
    {
      q: 'Should I delete duplicate postings?',
      a: 'No — group them, merge the richest value per field, and prefer the employer own posting as canonical. A wrong grouping then costs nothing.',
    },
    {
      q: 'How do you handle agency listings with no employer name?',
      a: 'Fall back to distinctive description content — a specific stack, an unusual responsibility, a named product. It is less reliable and it is the only signal present.',
    },
    {
      q: 'Why is blocking necessary?',
      a: 'Because comparing every pair is quadratic. Normalised employer, title and location narrow the candidates to a handful before anything expensive runs.',
    },
  ],
  related: ['how-to-build-an-ai-job-finder-using-job-apis', 'how-to-build-an-ai-job-aggregator-with-llms', 'how-embeddings-improve-job-recommendations'],
};

export default post;

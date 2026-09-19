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
  excerpt:
    'Two postings for the same job rarely share a single identical field. Two postings for genuinely different jobs often share almost all of them.',
  sections: [
    {
      heading: 'Why duplicates are the default',
      paragraphs: [
        'One opening is posted to the employer’s careers page, syndicated to several boards, reposted by two agencies with the company name removed, and refreshed a fortnight later with a slightly different title. Every one of those is a separate record arriving in your pipeline.',
        'Left unhandled this is not cosmetic. It skews your matching, wastes tokens scoring the same role repeatedly, and in an applying system risks sending several applications to one employer — which is the worst outcome the system can produce.',
      ],
    },
    {
      heading: 'Why exact matching fails',
      paragraphs: [
        'Title and company seems obvious and catches almost nothing. "Senior Software Engineer" and "Software Engineer III" are the same role; "Acme Ltd" and "Acme Technologies Limited" are the same employer; an agency posting has neither.',
        'The mirror problem is worse. Two genuinely different openings at the same company — same title, same location, different teams — match on every field you would compare. Merging those loses a real opportunity, which is a quieter failure than showing a duplicate and a more expensive one.',
      ],
    },
    {
      heading: 'A layered approach',
      paragraphs: [
        'No single technique works. What works is a cascade, cheapest first, escalating only for the genuinely ambiguous pairs — which keeps the cost of the expensive layer proportional to the hard cases rather than to the corpus.',
        'The ordering matters as much as the techniques: each layer should either decide confidently or pass the pair along, never guess to avoid the next layer.',
      ],
      bullets: [
        'Normalise first — company suffixes, title conventions, whitespace',
        'Exact match on a canonical key where the source gives a stable job id',
        'Fingerprint the description — hashing shingles catches verbatim reposts',
        'Embed and compare — catches rewrites that exact methods miss',
        'Model adjudication on the remaining ambiguous pairs only',
      ],
    },
    {
      heading: 'Setting the threshold honestly',
      paragraphs: [
        'Embedding similarity gives you a number and you must choose a cut-off. The instinct is to pick one that maximises accuracy on a sample, which hides an asymmetry: the two error types are not equally bad.',
        'A false merge loses a real job the candidate never sees. A false split shows a duplicate, which is mildly annoying. So the threshold should be deliberately conservative — prefer showing a duplicate to hiding an opportunity — and that is a product decision, not a tuning exercise.',
      ],
    },
    {
      heading: 'Keep the group, not the winner',
      paragraphs: [
        'When you decide two records are the same role, do not discard one. Store a group with all member postings, and pick a canonical representative for display.',
        'This matters because different sources carry different information: one has the salary, another the full description, a third the direct application link. Merging by keeping the richest value per field gives a better record than any single source provided — and if your grouping turns out to be wrong, nothing has been lost.',
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
      a: 'A cascade: normalise, exact-match on stable ids, fingerprint descriptions for verbatim reposts, embed and compare for rewrites, and only send the remaining ambiguous pairs to a model.',
    },
    {
      q: 'How should I choose the similarity threshold?',
      a: 'Conservatively. A false merge hides a real job from the candidate; a false split just shows a duplicate. The errors are not equally costly, so the cut-off is a product decision rather than a tuning exercise.',
    },
    {
      q: 'Should I delete duplicate postings?',
      a: 'No — group them and pick a canonical representative. Different sources carry different fields, so merging the richest value per field produces a better record than any one source, and a wrong grouping costs nothing.',
    },
  ],
  related: ['how-to-build-an-ai-job-finder-using-job-apis', 'how-to-build-an-ai-job-aggregator-with-llms', 'how-embeddings-improve-job-recommendations'],
};

export default post;

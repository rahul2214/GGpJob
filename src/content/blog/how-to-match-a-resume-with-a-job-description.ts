import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-match-a-resume-with-a-job-description',
  tint: 'emerald',
  title: 'How to Match a Resume With a Job Description Using AI',
  heading: 'Matching a CV to a posting',
  description:
    'The three matching approaches — keyword, embedding and model reasoning — what each gets wrong, and the layered design that uses all three well.',
  keywords: [
    'match resume to job description',
    'resume job matching ai',
    'semantic resume matching',
    'keyword vs embedding matching',
    'cv jd comparison',
    'matching pipeline design',
    'ai candidate matching',
    'resume similarity',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Three techniques, each wrong in a different direction. Used in the right order they cover each other; used alone, each fails predictably.',
  sections: [
    {
      heading: 'Keyword matching: fast, cheap, wrong',
      paragraphs: [
        'Counting shared terms is free and instant, and it fails in both directions. It misses a candidate who wrote "built data pipelines" against a posting asking for "ETL", and it rewards a candidate who listed every technology they have heard of.',
        'It is still useful as a first filter for hard requirements that are genuinely literal — a specific certification, a named platform. Just never as the scoring mechanism.',
      ],
    },
    {
      heading: 'Embeddings: better, and easily misread',
      paragraphs: [
        'Comparing vector representations captures meaning, so synonyms and paraphrases match. This solves the obvious keyword failures and introduces a subtler one: similarity is not suitability.',
        'A junior developer’s CV and a principal engineer posting in the same domain are textually very similar — same technologies, same vocabulary — and produce a high similarity score for a completely unsuitable match. Embeddings measure topical closeness, not whether someone can do the job.',
      ],
    },
    {
      heading: 'Model reasoning: accurate and expensive',
      paragraphs: [
        'Giving a model the CV and the posting and asking whether the candidate meets each requirement is the most accurate approach. It handles transferable experience, recognises that six years of one thing implies another, and can explain itself.',
        'It also costs orders of magnitude more per comparison and takes seconds rather than milliseconds. Running it across thousands of postings per candidate is not viable, which is what forces the layered design.',
      ],
    },
    {
      heading: 'The layered pipeline',
      paragraphs: [
        'Use the cheap methods to narrow and the expensive one to decide. Each layer should only pass forward what it cannot rule out confidently, so the costly reasoning runs on a small, plausible set.',
        'The ordering matters: hard filters first because they are binary and free, then embeddings to rank by topical relevance, then the model on the top candidates only.',
      ],
      bullets: [
        'Hard filters — location, right to work, clear seniority mismatch',
        'Embedding similarity — rank the remainder by topical closeness',
        'Model reasoning — evaluate only the top slice, requirement by requirement',
        'Explanation — produced only for what will actually be shown',
      ],
    },
    {
      heading: 'Match against evidence, not the whole document',
      paragraphs: [
        'Embedding an entire CV as one vector blurs everything together — a two-week project and a five-year role contribute equally. Comparing that blur to a posting produces a number that is hard to interpret and harder to improve.',
        'Match at the level of claims instead: individual roles or achievements against individual requirements. That gives you a per-requirement result, which is what makes a score explainable and lets you tell the candidate precisely which requirement is unmet.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why is keyword matching bad for resumes?',
      a: 'It fails both ways: it misses "built data pipelines" against a posting asking for "ETL", and rewards candidates who list every technology they have heard of. Useful only for genuinely literal requirements.',
    },
    {
      q: 'Are embeddings enough for job matching?',
      a: 'No. They measure topical similarity, not suitability. A junior CV and a principal posting in the same domain look very similar because they share vocabulary, yet the match is wrong.',
    },
    {
      q: 'Why not use a model for every comparison?',
      a: 'Cost and latency. Model reasoning is the most accurate approach and orders of magnitude more expensive, so it belongs on a shortlist that cheaper layers have already narrowed.',
    },
    {
      q: 'Should I embed the whole CV as one vector?',
      a: 'No — it blurs a two-week project and a five-year role together. Match individual claims against individual requirements, which gives you a per-requirement result you can explain.',
    },
  ],
  related: ['how-to-calculate-resume-to-job-match-score', 'keyword-matching-vs-semantic-matching', 'how-to-build-a-job-matching-system-using-embeddings'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-job-matching-system-using-embeddings',
  tint: 'emerald',
  title: 'How to Build a Job Matching System Using Embeddings',
  heading: 'Matching with embeddings',
  description:
    'Practical embedding-based matching: what to embed, chunking CVs and postings, choosing a model, handling re-embedding, and the pitfalls that ruin results.',
  keywords: [
    'job matching embeddings',
    'embedding based matching',
    'vector job search build',
    'what to embed jobs',
    'embedding chunking strategy',
    'cosine similarity jobs',
    'embedding model choice',
    'reembedding strategy',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Most embedding matching disappoints for one reason: embedding whole documents. What you embed matters more than which model you use.',
  sections: [
    {
      heading: 'Choose the unit before the model',
      paragraphs: [
        'Teams agonise over which embedding model to use and then embed an entire CV as one vector. That decision costs far more accuracy than any model choice recovers.',
        'A whole-document vector averages everything: a short course and a five-year role pull equally, and the result is a generic point in space that is near everything vaguely technical and precisely near nothing.',
      ],
    },
    {
      heading: 'Embed claims, not documents',
      paragraphs: [
        'Split a CV into individual roles or achievements and embed each. Split a posting into individual requirements and embed those. Now you can compare claim to requirement and get a per-requirement result rather than one opaque number.',
        'This also makes the output explainable. "This role matches because of your work at X" is possible when the match happened between identifiable pieces; it is not when you compared two blurred averages.',
      ],
      bullets: [
        'CV → one vector per role or substantial achievement',
        'Posting → one vector per distinct requirement',
        'Match pairwise, keep the best match per requirement',
        'Aggregate with the requirement weights, not by averaging vectors',
      ],
    },
    {
      heading: 'Model choice matters less than you expect',
      paragraphs: [
        'Any competent current embedding model will serve. The differences between reasonable choices are small relative to the difference between good and bad chunking, so do not spend weeks benchmarking before your pipeline works.',
        'Two practical constraints do matter: dimensionality drives storage and query cost at scale, and switching models later means re-embedding everything. Pick something you are content to keep, and store which model produced each vector so a migration is possible.',
      ],
    },
    {
      heading: 'Plan for re-embedding',
      paragraphs: [
        'You will change the model or the chunking, and when you do, every existing vector becomes incomparable with new ones. Mixing them silently produces nonsense results that look plausible.',
        'Store the model identifier and chunking version alongside each vector, and support running two generations side by side during a migration. Systems without this end up choosing between a costly big-bang re-embed and never improving.',
      ],
    },
    {
      heading: 'Similarity is not suitability',
      paragraphs: [
        'The failure to keep in mind: embeddings measure topical closeness. A junior CV and a staff-level posting in the same field are highly similar because they use the same vocabulary, and the match is wrong.',
        'So keep the hard constraints out of the vector space entirely. Seniority, location, right to work and compensation belong in structured filters applied before or after similarity, never left for the embedding to represent.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I embed a whole CV as one vector?',
      a: 'No — that averages a short course and a five-year role together, producing a point that is near everything vaguely relevant and precisely near nothing. Embed individual roles and achievements.',
    },
    {
      q: 'Which embedding model should I use?',
      a: 'Any competent current one. The gap between reasonable models is small compared with the gap between good and bad chunking, so get the pipeline right before benchmarking models.',
    },
    {
      q: 'What happens when I change embedding models?',
      a: 'Existing vectors become incomparable with new ones, and mixing them produces plausible nonsense. Store the model and chunking version per vector and support running two generations during migration.',
    },
    {
      q: 'Why do embeddings match unsuitable candidates?',
      a: 'They measure topical similarity, not suitability — a junior CV and a staff posting share vocabulary. Keep seniority, location and eligibility in structured filters rather than in the vector space.',
    },
  ],
  related: ['how-embeddings-improve-job-recommendations', 'how-to-build-semantic-job-search', 'how-to-use-vector-databases-for-ai-job-matching'],
};

export default post;

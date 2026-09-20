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
  anchors: ['matching with embeddings', 'chunking strategy'],
  excerpt:
    'Most embedding matching disappoints for one reason: embedding whole documents. What you embed matters more than which model you use.',
  keyTakeaways: [
    'The chunking decision costs more accuracy than any model choice recovers.',
    'Embed claims against requirements, which also makes the result explainable.',
    'Pick a competent model, record which one produced each vector, and move on.',
    'Store the model and chunking version, or a future migration becomes impossible.',
    'Similarity measures topical closeness — keep seniority and eligibility out of the vector space.',
  ],
  sections: [
    {
      heading: 'Choose the unit before the model',
      paragraphs: [
        'Teams agonise over which embedding model to use and then embed an entire CV as one vector. That decision costs far more accuracy than any model choice recovers.',
        'A whole-document vector averages everything: a short course and a five-year role pull equally, and the result is a generic point in space that is near everything vaguely technical and precisely near nothing.',
        'The effect is visible as soon as you look at results. Every candidate in a field looks similar to every posting in that field, scores cluster in a narrow band, and the ranking is essentially arbitrary within it — which reads as "the matching does not work" without pointing at the cause.',
      ],
    },
    {
      heading: 'Embed claims, not documents',
      paragraphs: [
        'Split a CV into individual roles or achievements and embed each. Split a posting into individual requirements and embed those. Now you can compare claim to requirement and get a per-requirement result rather than one opaque number.',
        'This also makes the output explainable. "This role matches because of your work at X" is possible when the match happened between identifiable pieces; it is not when you compared two blurred averages.',
        'Aggregation should take the best match per requirement rather than an average across all pairs. A candidate who covers six of eight requirements strongly and two not at all is a better fit than one who is mediocre on all eight, and averaging cannot distinguish them.',
      ],
      bullets: [
        'CV → one vector per role or substantial achievement',
        'Posting → one vector per distinct requirement',
        'Match pairwise, keep the best match per requirement',
        'Aggregate with the requirement weights, not by averaging vectors',
      ],
      table: {
        caption: 'Chunking choices and what they cost',
        columns: ['Unit', 'Accuracy', 'Cost', 'Explainable'],
        rows: [
          ['Whole CV, whole posting', 'Poor', 'Lowest', 'No'],
          ['Per role, whole posting', 'Fair', 'Low', 'Partly'],
          ['Per role, per requirement', 'Good', 'Higher', 'Yes'],
          ['Per sentence', 'Noisy', 'Highest', 'Too granular'],
        ],
      },
    },
    {
      heading: 'Clean the text before you embed it',
      paragraphs: [
        'Postings contain a great deal that carries no matching signal: benefits paragraphs, equal-opportunity statements, company history, application instructions. Every posting’s boilerplate resembles every other posting’s, so including it pulls all vectors towards a common centre.',
        'Stripping it is usually a larger improvement than anything else available at this stage, and it is a preprocessing step rather than a modelling one. The same applies on the candidate side, where formatting artefacts and padded skills lists dilute the parts that matter.',
        'Keep the raw text as well as the cleaned version. Extraction rules change, and re-deriving chunks from a stored original is a batch job, whereas re-fetching postings that have since expired is not possible at all.',
      ],
    },
    {
      heading: 'Model choice matters less than you expect',
      paragraphs: [
        'Any competent current embedding model will serve. The differences between reasonable choices are small relative to the difference between good and bad chunking, so do not spend weeks benchmarking before your pipeline works.',
        'Two practical constraints do matter: dimensionality drives storage and query cost at scale, and switching models later means re-embedding everything. Pick something you are content to keep, and store which model produced each vector so a migration is possible.',
        'Build a small evaluation set early rather than a model comparison. Fifty pairs a knowledgeable person has labelled as good or bad matches will tell you more about a change than any published benchmark, because it measures your documents and your chunking rather than someone else’s.',
      ],
    },
    {
      heading: 'Plan for re-embedding',
      paragraphs: [
        'You will change the model or the chunking, and when you do, every existing vector becomes incomparable with new ones. Mixing them silently produces nonsense results that look plausible.',
        'Store the model identifier and chunking version alongside each vector, and support running two generations side by side during a migration. Systems without this end up choosing between a costly big-bang re-embed and never improving.',
        'Make the version part of the query rather than a column you remember to filter on. A query that can only return vectors of the active generation cannot accidentally mix them, which is a stronger guarantee than a convention every future query must observe.',
      ],
    },
    {
      heading: 'Similarity is not suitability',
      paragraphs: [
        'The failure to keep in mind: embeddings measure topical closeness. A junior CV and a staff-level posting in the same field are highly similar because they use the same vocabulary, and the match is wrong.',
        'So keep the hard constraints out of the vector space entirely. Seniority, location, right to work and compensation belong in structured filters applied before or after similarity, never left for the embedding to represent.',
        'Treat similarity as retrieval rather than as the answer. It decides what is worth looking at; a ranking layer using seniority distance, recency, salary fit and outcome data decides what is worth showing — and separating the two is also what makes a bad result diagnosable.',
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
    {
      q: 'How should per-requirement scores be aggregated?',
      a: 'Best match per requirement, weighted. Averaging cannot distinguish a candidate strong on six of eight requirements from one who is mediocre on all eight.',
    },
    {
      q: 'What is the cheapest large improvement available?',
      a: 'Stripping boilerplate before embedding. Every posting benefits paragraph resembles every other one, so including it pulls all vectors towards a common centre.',
    },
  ],
  related: ['how-embeddings-improve-job-recommendations', 'how-to-build-semantic-job-search', 'how-to-use-vector-databases-for-ai-job-matching'],
};

export default post;

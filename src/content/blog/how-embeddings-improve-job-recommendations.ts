import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-embeddings-improve-job-recommendations',
  tint: 'emerald',
  title: 'How Embeddings Improve Job Recommendations',
  heading: 'What embeddings fix, and what they do not',
  description:
    'Where embeddings genuinely improve job recommendations, the failure modes they introduce, and how to combine them with behaviour and hard constraints.',
  keywords: [
    'embeddings job recommendations',
    'recommendation quality embeddings',
    'content based job recommendations',
    'cold start job recommender',
    'embedding recommendations pitfalls',
    'semantic recommendations',
    'job feed relevance',
    'personalised job recommendations',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['job recommendations', 'cold-start problem'],
  excerpt:
    'Embeddings solve the cold-start problem that sinks most job recommenders — and then quietly create a filter bubble if that is all you use.',
  keyTakeaways: [
    'Content embeddings work where collaborative filtering cannot, because job inventory turns over too fast to accumulate behaviour.',
    'They absorb the chaos of job titles without anyone maintaining a taxonomy.',
    'A feed built purely on similarity converges within a fortnight and fails career changers.',
    'Similarity says what a role is about, never whether it is a step forward or legally available.',
    'Retrieve with embeddings, gate on hard constraints, rank with everything else.',
  ],
  sections: [
    {
      heading: 'The cold-start problem they actually solve',
      paragraphs: [
        'Collaborative filtering needs behaviour, and a job board rarely has enough of it. Postings expire in weeks, most have almost no interaction history, and a new candidate has none at all. "People who applied to this also applied to that" needs data that does not exist yet.',
        'Embeddings sidestep this because they work from content. A posting published an hour ago can be recommended immediately, on the strength of what it says. For a marketplace where the inventory turns over constantly, that is the difference between a working recommender and an empty one.',
        'The severity of this is easy to underestimate until you look at the distribution. In most job marketplaces the large majority of postings never accumulate enough interaction to be recommendable behaviourally at all, so a purely collaborative system would recommend the same small set of popular roles to everyone, forever.',
      ],
    },
    {
      heading: 'They understand the words nobody standardised',
      paragraphs: [
        'Job titles are chaos. The same role is a "Solutions Engineer", a "Sales Engineer", a "Technical Account Manager" and a "Pre-Sales Consultant" depending on the company. Taxonomies try to normalise this and are perpetually out of date.',
        'Embeddings do not need the taxonomy. They place those titles near each other because the surrounding text describes the same work, and they keep doing so as new titles appear — which they will, faster than anyone maintains a list.',
        'The same property covers skill vocabulary. A posting asking for container orchestration experience and a CV describing Kubernetes work land close together without anyone writing the synonym down, and that mapping stays current as the vocabulary shifts underneath it.',
      ],
    },
    {
      heading: 'The filter bubble they create',
      paragraphs: [
        'A recommender built purely on similarity to what someone already did converges. Show a candidate roles resembling their last application, learn from what they click, and within a fortnight the feed is a narrow band around where they started.',
        'That is bad for candidates, who may be trying to change direction, and bad for the marketplace, which needs candidates to see roles they would not have searched for. Deliberate exploration is not a nice-to-have here; it is what stops the system collapsing inward.',
        'The mechanism is a feedback loop rather than a bug in the similarity function. The system shows what it believes the candidate wants, learns from clicks on what it showed, and never observes a preference for anything outside the band — so the evidence always confirms the narrowing.',
      ],
      bullets: [
        'Reserve a slice of every feed for adjacent rather than similar roles',
        'Weight recent signals over old ones so a career change registers',
        'Let candidates state intent explicitly and treat it as stronger than behaviour',
        'Track how varied the feed is over time, not only its click-through rate',
      ],
      table: {
        caption: 'What each signal is good for',
        columns: ['Signal', 'Strength', 'Blind spot'],
        rows: [
          ['Content embedding', 'New postings, messy titles', 'Says nothing about quality or level'],
          ['Behaviour', 'Reveals actual preference', 'Needs history; reinforces the past'],
          ['Stated intent', 'The only source of a change', 'Sparse, and quickly stale'],
          ['Hard constraints', 'Binary and reliable', 'Excludes nothing it is not told'],
          ['Outcome data', 'Grounded in what worked', 'Delayed and thin'],
        ],
      },
    },
    {
      heading: 'Similarity is not desirability',
      paragraphs: [
        'The recurring mistake is treating a high similarity score as a good recommendation. A posting can be a near-perfect textual match to someone’s CV and be a lateral move at lower pay in a city they cannot relocate to.',
        'Embeddings capture what a role is about. They say nothing about whether it is a step forward, whether the compensation works, or whether the person is eligible. Those are separate signals, and they belong in separate layers rather than being hoped for from the vector space.',
        'There is a specific perverse case worth naming: the most textually similar posting to someone’s CV is frequently their current job at a competitor. It is an excellent match by cosine distance and a terrible recommendation for anyone whose reason for looking is that they want something different.',
      ],
    },
    {
      heading: 'What you embed matters more than which model',
      paragraphs: [
        'Teams spend a long time comparing embedding models and very little time on what text goes into them, which is the wrong ratio. A posting embedded whole — including the benefits paragraph, the legal boilerplate and the company history — is mostly noise, and every posting’s boilerplate is similar to every other posting’s.',
        'Extracting the responsibilities and requirements before embedding, and dropping the rest, usually improves results more than changing models does. The same applies on the candidate side: a CV’s formatting artefacts and skills-list padding dilute the parts that carry the signal.',
        'Embedding at the right granularity is the other half. One vector for an entire CV blurs a career into an average; separate vectors per role, matched against the posting and aggregated with the best match dominating, preserves the fact that someone did one very relevant thing three years ago.',
      ],
      bullets: [
        'Strip boilerplate before embedding — it is similar across every posting',
        'Embed responsibilities and requirements, not the whole document',
        'Per-role vectors on the candidate side, not one blurred average',
        'Re-embed when the source changes, and version the model used',
      ],
    },
    {
      heading: 'The combination that works',
      paragraphs: [
        'Use embeddings as the retrieval layer: they find the plausible set quickly and handle new postings and new candidates. Apply hard constraints as filters, because eligibility is binary and should never be traded against relevance.',
        'Then rank with everything else you know — recency, seniority fit, salary band, application outcomes, employer response rates. The embedding decides what is in the running; the ranking decides what is worth showing.',
        'This layering also keeps the system debuggable. When a bad recommendation appears you can see whether retrieval surfaced it, a filter failed to exclude it, or ranking promoted it, and those have three completely different fixes — which is not true of a single model that produces a number.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why use embeddings instead of collaborative filtering for jobs?',
      a: 'Because job boards lack the behaviour data collaborative filtering needs. Postings expire in weeks and new candidates have no history, whereas a content embedding lets an hour-old posting be recommended immediately.',
    },
    {
      q: 'Do embeddings handle inconsistent job titles?',
      a: 'Yes, and that is one of their strongest advantages. They place "Solutions Engineer" and "Sales Engineer" near each other from the surrounding text, without a taxonomy anyone has to maintain.',
    },
    {
      q: 'What is the main risk of embedding-based recommendations?',
      a: 'Convergence. A feed built purely on similarity narrows to a band around where the candidate started, which fails anyone trying to change direction. Reserve part of the feed for adjacent roles.',
    },
    {
      q: 'Should the embedding decide the final ranking?',
      a: 'No. Let it decide what is in the running, then rank with recency, seniority fit, salary and outcome data. Similarity says what a role is about, not whether it is a step forward.',
    },
    {
      q: 'What improves results more than changing embedding models?',
      a: 'Changing what you embed. Stripping boilerplate and embedding only responsibilities and requirements usually beats model shopping, because every posting boilerplate resembles every other one.',
    },
    {
      q: 'Should a CV be one vector or several?',
      a: 'Several — one per role. A single vector averages a career, which loses the fact that someone did one highly relevant thing three years ago.',
    },
  ],
  related: ['how-to-build-an-ai-job-recommendation-engine', 'how-to-build-a-job-matching-system-using-embeddings', 'how-to-build-a-recommendation-engine-for-jobs'],
  references: [
    {
      title: 'pgvector',
      url: 'https://github.com/pgvector/pgvector',
      publisher: 'GitHub',
      note: 'Vector similarity search in PostgreSQL, including the available index types.',
    },
    {
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      publisher: 'arXiv',
      note: 'The architecture underlying the models that produce these embeddings.',
    },
  ],
};

export default post;

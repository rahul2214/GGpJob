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
  excerpt:
    'Embeddings solve the cold-start problem that sinks most job recommenders — and then quietly create a filter bubble if that is all you use.',
  sections: [
    {
      heading: 'The cold-start problem they actually solve',
      paragraphs: [
        'Collaborative filtering needs behaviour, and a job board rarely has enough of it. Postings expire in weeks, most have almost no interaction history, and a new candidate has none at all. "People who applied to this also applied to that" needs data that does not exist yet.',
        'Embeddings sidestep this because they work from content. A posting published an hour ago can be recommended immediately, on the strength of what it says. For a marketplace where the inventory turns over constantly, that is the difference between a working recommender and an empty one.',
      ],
    },
    {
      heading: 'They understand the words nobody standardised',
      paragraphs: [
        'Job titles are chaos. The same role is a "Solutions Engineer", a "Sales Engineer", a "Technical Account Manager" and a "Pre-Sales Consultant" depending on the company. Taxonomies try to normalise this and are perpetually out of date.',
        'Embeddings do not need the taxonomy. They place those titles near each other because the surrounding text describes the same work, and they keep doing so as new titles appear — which they will, faster than anyone maintains a list.',
      ],
    },
    {
      heading: 'The filter bubble they create',
      paragraphs: [
        'A recommender built purely on similarity to what someone already did converges. Show a candidate roles resembling their last application, learn from what they click, and within a fortnight the feed is a narrow band around where they started.',
        'That is bad for candidates, who may be trying to change direction, and bad for the marketplace, which needs candidates to see roles they would not have searched for. Deliberate exploration is not a nice-to-have here; it is what stops the system collapsing inward.',
      ],
      bullets: [
        'Reserve a slice of every feed for adjacent rather than similar roles',
        'Weight recent signals over old ones so a career change registers',
        'Let candidates state intent explicitly and treat it as stronger than behaviour',
        'Track how varied the feed is over time, not only its click-through rate',
      ],
    },
    {
      heading: 'Similarity is not desirability',
      paragraphs: [
        'The recurring mistake is treating a high similarity score as a good recommendation. A posting can be a near-perfect textual match to someone’s CV and be a lateral move at lower pay in a city they cannot relocate to.',
        'Embeddings capture what a role is about. They say nothing about whether it is a step forward, whether the compensation works, or whether the person is eligible. Those are separate signals, and they belong in separate layers rather than being hoped for from the vector space.',
      ],
    },
    {
      heading: 'The combination that works',
      paragraphs: [
        'Use embeddings as the retrieval layer: they find the plausible set quickly and handle new postings and new candidates. Apply hard constraints as filters, because eligibility is binary and should never be traded against relevance.',
        'Then rank with everything else you know — recency, seniority fit, salary band, application outcomes, employer response rates. The embedding decides what is in the running; the ranking decides what is worth showing.',
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
  ],
  related: ['how-to-build-an-ai-job-recommendation-engine', 'how-to-build-a-job-matching-system-using-embeddings', 'how-to-build-a-recommendation-engine-for-jobs'],
};

export default post;

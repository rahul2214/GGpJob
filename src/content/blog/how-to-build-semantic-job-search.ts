import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-semantic-job-search',
  tint: 'emerald',
  title: 'How to Build Semantic Job Search Using Vector Databases',
  heading: 'Building semantic job search',
  description:
    'A working design for semantic job search: what to index, hybrid retrieval, filtering without wrecking recall, re-ranking, and how to tell whether it improved.',
  keywords: [
    'semantic job search',
    'vector search jobs',
    'hybrid retrieval jobs',
    'build semantic search',
    'job search relevance',
    'reranking search results',
    'search evaluation',
    'vector database search',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['semantic job search', 'hybrid retrieval'],
  excerpt:
    'Semantic search feels magical in a demo and disappoints in production for reasons that are entirely predictable — and mostly avoidable.',
  keyTakeaways: [
    'Embedding a whole posting averages requirements together with boilerplate.',
    'Vector search misses the exact tokens users care most about, so run lexical alongside it.',
    'Filtering after retrieval leaves a handful of results; the filter belongs inside it.',
    'Retrieval optimises recall and ranking optimises precision — do them separately.',
    'Build the evaluation set before launch, or every tuning decision is a guess.',
  ],
  sections: [
    {
      heading: 'Index the posting in pieces',
      paragraphs: [
        'Embedding an entire job posting as one vector puts the benefits, the boilerplate about equal opportunity and the actual requirements into a single average. Searches then match on the parts nobody cares about.',
        'Split the posting into meaningful units — the role summary, each requirement, the responsibilities — and embed those separately. Keep a pointer back to the posting so retrieval can deduplicate to one result per job.',
        'Strip the boilerplate before embedding rather than relying on the split to isolate it. Every posting’s benefits paragraph resembles every other one, so including it pulls all vectors towards a common centre and compresses the distances you are trying to use.',
      ],
    },
    {
      heading: 'Run lexical search alongside it',
      paragraphs: [
        'Pure vector search fails on the exact tokens users care most about: a named framework, a clearance level, a specific certification. It returns things broadly about the area and misses the precise term typed into the box.',
        'Run both retrievers and fuse the rankings. Reciprocal rank fusion is the reliable default because it combines orderings rather than scores, and lexical and vector scores are not on a comparable scale — averaging them silently favours whichever produces larger numbers.',
        'Weight the section a term matched in. A phrase in the role title should outrank the same phrase buried in a company history paragraph, and a lexical index that treats every part of the document equally produces results a user reads as obviously wrong.',
      ],
      bullets: [
        'Lexical retrieval for rare and exact terms',
        'Vector retrieval for intent and paraphrase',
        'Rank fusion to merge the two lists',
        'Deduplicate to one row per posting after fusion',
      ],
      table: {
        caption: 'Which retriever earns which query',
        columns: ['Query', 'Wins', 'Why'],
        rows: [
          ['"SC cleared"', 'Lexical', 'Binary, exact, no synonym'],
          ['"platform engineering"', 'Vector', 'Titles vary by employer'],
          ['"Kubernetes"', 'Both', 'Exact term with real synonyms'],
          ['"remote job in fintech"', 'Vector plus filter', 'Intent plus a constraint'],
          ['"AWS Solutions Architect Associate"', 'Lexical', 'A named certification'],
          ['"something less stressful"', 'Neither', 'Not a retrieval problem'],
        ],
      },
    },
    {
      heading: 'Filter before you retrieve, not after',
      paragraphs: [
        'Job search always carries constraints: country, right to work, employment type, whether the posting is still open. Retrieving the top hundred by similarity and then filtering leaves you with a handful, because most of the hundred were somewhere else.',
        'The filter has to be part of the retrieval. Check that your store supports this properly — filtered search or pre-filtering — because this one property matters more for job search than benchmark latency ever will.',
        'Watch the awkward middle case. A filter selective enough to matter but not selective enough for the planner to abandon the approximate index leaves the search exploring candidates the filter then removes, returning fewer results than requested — which looks like a thin market rather than a query problem.',
      ],
    },
    {
      heading: 'Re-rank the shortlist',
      paragraphs: [
        'Retrieval optimises for recall: get the plausible set. Ranking optimises for precision: order it well. Trying to do both in one step is why results feel almost right but never quite.',
        'Take the fused top fifty and re-rank them with a cross-encoder or a model that sees the query and posting together. It is expensive per pair, which is why it runs on fifty rows and not fifty thousand.',
        'Add the signals a similarity score cannot see. Freshness, whether the employer responds, and how well the seniority matches all belong in the ranking layer, because a textually perfect match at a company that never replies is not a good result.',
      ],
    },
    {
      heading: 'Freshness is a correctness property here',
      paragraphs: [
        'Most search systems treat staleness as a quality issue. In job search it is closer to a correctness one: a closed posting is not a slightly worse result, it is a wrong one, and a user sent to two dead links stops trusting everything else the search returns.',
        'Index new postings quickly and remove closed ones promptly, and if you cannot guarantee either, show the posted date so the user can judge. A visible date is a far better answer than silence about a listing that may be six weeks old.',
        'Re-check the handful you are about to show rather than the whole index. Verifying fifty results costs almost nothing and catches most of the damage, where nightly verification of everything is expensive and mostly re-confirms postings nobody will see.',
      ],
    },
    {
      heading: 'Decide how you will know it worked',
      paragraphs: [
        'Build the evaluation set before the launch, not after the complaints. A few hundred real queries with judged results is enough to tell whether a change helped, and without it every tuning decision is a guess dressed up as engineering.',
        'Watch the behavioural signals too — searches returning nothing, searches immediately refined, results clicked below position ten. Those tell you where the system is failing in ways an offline metric will not.',
        'Log the empty searches in particular. A query that returns nothing is the clearest possible statement that the index, the filters or the vocabulary handling has a gap, and it is the cheapest list of improvements you will ever assemble.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I embed the whole job posting?',
      a: 'No. That averages requirements together with benefits and equal-opportunity boilerplate. Embed the summary, responsibilities and each requirement separately, with a pointer back to the posting.',
    },
    {
      q: 'Is vector search enough on its own?',
      a: 'No. It misses exact tokens users care about — a named framework, a clearance level, a certification. Run lexical retrieval alongside it and fuse the rankings.',
    },
    {
      q: 'Why does filtering after retrieval fail?',
      a: 'Because most of the top hundred by similarity will be outside your country or already closed, leaving a handful of results. The filter must be part of retrieval, not applied afterwards.',
    },
    {
      q: 'Do I need a re-ranking step?',
      a: 'If you want results that feel right rather than nearly right, yes. Re-rank the fused top fifty, and include freshness, seniority fit and employer responsiveness there.',
    },
    {
      q: 'Why is freshness a correctness issue in job search?',
      a: 'Because a closed posting is a wrong result rather than a worse one. Two dead links and the user stops trusting everything else the search returns.',
    },
    {
      q: 'What is the cheapest source of search improvements?',
      a: 'Logged empty searches. Each one is a clear statement that the index, the filters or the vocabulary handling has a gap.',
    },
  ],
  related: ['keyword-matching-vs-semantic-matching', 'how-to-use-vector-databases-for-ai-job-matching', 'how-to-use-llms-to-rank-job-listings'],
};

export default post;

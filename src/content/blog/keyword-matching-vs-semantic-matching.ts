import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'keyword-matching-vs-semantic-matching',
  tint: 'emerald',
  title: 'Keyword Matching vs Semantic Matching for Job Search',
  heading: 'Keyword or semantic search?',
  description:
    'Where keyword search still wins, where semantic search wins, why hybrid retrieval beats both, and what this means for candidates writing a CV.',
  keywords: [
    'keyword vs semantic matching',
    'semantic job search',
    'hybrid search jobs',
    'bm25 vs embeddings',
    'lexical vs vector search',
    'job search relevance',
    'search ranking jobs',
    'ats keyword matching',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['keyword or semantic', 'lexical matching'],
  excerpt:
    'Semantic search is not a replacement for keyword search. They fail on opposite inputs, which is precisely why the good systems run both.',
  keyTakeaways: [
    'The two methods fail on opposite inputs, which is the whole argument for running both.',
    'For rare precise tokens, lexical matching is correct rather than merely adequate.',
    'Semantic retrieval wins when the searcher does not know the vocabulary the postings use.',
    'Fuse the rankings; the two scores are not on a comparable scale.',
    'Write a CV containing both the plain description and the literal term.',
  ],
  sections: [
    {
      heading: 'They fail on opposite things',
      paragraphs: [
        'Keyword search fails when the same idea is expressed differently — "ETL" and "data pipelines", "SDR" and "sales development". It returns nothing and the user concludes there are no such jobs.',
        'Semantic search fails on exact tokens: a specific certification name, a version number, an uncommon product, an acronym it has not learned. It returns things that are broadly about the right area and miss the precise thing the user typed.',
        'Note which failure is visible. Keyword search returning nothing tells the user something went wrong; semantic search returning ten plausible-looking results that all lack the required clearance tells them nothing at all, which is why the quieter failure deserves more attention.',
      ],
    },
    {
      heading: 'Keyword search is better than its reputation',
      paragraphs: [
        'For rare, precise terms, lexical matching is not merely adequate — it is correct. Someone searching for an exact framework, a clearance level or a named qualification wants documents containing that token, not documents that are conceptually adjacent.',
        'It is also instant, cheap, and completely explainable: you can point at why a result matched. Those properties matter more in production than they do in benchmarks.',
        'Weighting the section a term matched in extends that advantage considerably. A phrase in the job title should outrank the same phrase buried in a company history paragraph, and a lexical index treating every part of the document equally produces results a user reads as obviously wrong.',
      ],
    },
    {
      heading: 'Semantic search earns its place on intent',
      paragraphs: [
        'Where it wins is when the user does not know the vocabulary the postings use. "Jobs where I help customers succeed technically" has no literal match and a clear meaning, and only an embedding-based approach connects it to solutions engineering roles.',
        'This is also the case for CV-to-job matching, where the candidate never chose their words with a search engine in mind.',
        'Job titles are the strongest everyday case. The same work is advertised as platform engineer, infrastructure engineer, SRE and DevOps engineer depending on who wrote the posting, and only meaning-based retrieval reaches all four from one query.',
      ],
      table: {
        caption: 'Which retriever wins which query',
        columns: ['Query', 'Wins', 'Why'],
        rows: [
          ['"SC cleared"', 'Lexical', 'Binary, no synonym exists'],
          ['"AWS Solutions Architect Associate"', 'Lexical', 'A named certification'],
          ['"platform engineering"', 'Semantic', 'Four titles for one job'],
          ['"help customers succeed technically"', 'Semantic', 'Intent, no literal match'],
          ['"Kubernetes"', 'Both', 'Exact term with real synonyms'],
          ['"something less stressful"', 'Neither', 'Not a retrieval problem'],
        ],
      },
    },
    {
      heading: 'Hybrid, with fusion',
      paragraphs: [
        'Run both and combine the rankings. The standard approach is reciprocal rank fusion, which merges result lists without needing the two scores to be on a comparable scale — a detail that matters, because lexical and vector scores are not comparable and naive weighted averaging quietly favours whichever produces larger numbers.',
        'Then re-rank the merged top results with a cross-encoder or a model if quality justifies the cost. This is the architecture behind most search that feels good.',
        'Apply the hard filters inside retrieval rather than after it. Country, eligibility and whether a posting is still open are not signals to weigh, and filtering a fused top hundred afterwards leaves a handful because most of them were somewhere else.',
      ],
      bullets: [
        'Lexical retrieval for exact and rare terms',
        'Vector retrieval for intent and paraphrase',
        'Rank fusion rather than score averaging',
        'Optional re-ranking of the merged shortlist',
      ],
    },
    {
      heading: 'Where screening systems sit on this',
      paragraphs: [
        'It is worth being honest that employer-side screening is further behind than search. A great deal of it is still lexical, which is why a CV that describes work perfectly in the candidate’s own vocabulary can fail a filter it deserved to pass.',
        'That is changing unevenly rather than uniformly, so the safe assumption is that both methods are in play and neither can be relied on alone. Writing for only one is a bet on which system this particular employer happens to run.',
        'The practical consequence is asymmetric. Including a literal term costs a few words and occasionally saves an application; omitting it costs nothing until it costs the screen, which makes it insurance rather than optimisation.',
      ],
    },
    {
      heading: 'What this means if you are writing a CV',
      paragraphs: [
        'Since screening systems increasingly run both, write for both. Use the natural language that describes your work properly — semantic matching rewards it — and also include the literal terms a posting would use, because lexical matching only finds what is there.',
        'That is not keyword stuffing. It is writing "built and operated ETL pipelines" rather than choosing between the plain description and the jargon.',
        'The line is whether the term is true. A literal word added to a sentence describing work you did is accurate and matchable; a term added because a posting asked for it is a claim you will be asked about in the first technical conversation.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is semantic search better than keyword search?',
      a: 'Not universally — they fail on opposite inputs. Keyword search is correct for rare exact terms; semantic search handles intent and paraphrase. Good systems run both.',
    },
    {
      q: 'Why not just average the two scores?',
      a: 'Lexical and vector scores are not on a comparable scale, so averaging quietly favours whichever produces larger numbers. Rank fusion combines the orderings instead of the raw scores.',
    },
    {
      q: 'When does keyword search clearly win?',
      a: 'Rare, precise tokens: a certification name, a version, an uncommon product, an acronym. The user wants documents containing that term, not conceptually adjacent ones.',
    },
    {
      q: 'How should I write a CV given both are used?',
      a: 'Include the natural description and the literal term — "built and operated ETL pipelines" rather than choosing one. That serves both retrieval methods without stuffing keywords.',
    },
    {
      q: 'Which failure is more dangerous to a user?',
      a: 'The semantic one. Zero results tells them something is wrong; ten plausible results that all lack the required clearance tells them nothing.',
    },
    {
      q: 'Are employer screening systems semantic yet?',
      a: 'Unevenly. A great deal of screening remains lexical, so writing for only one method is a bet on which system this employer happens to run.',
    },
  ],
  related: ['how-to-match-a-resume-with-a-job-description', 'how-to-build-semantic-job-search', 'how-applicant-tracking-systems-work'],
};

export default post;

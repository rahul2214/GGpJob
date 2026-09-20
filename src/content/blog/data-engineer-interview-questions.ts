import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'data-engineer-interview-questions',
  tint: 'emerald',
  title: 'Data Engineer Interview Questions and What They Test',
  heading: 'Data engineer interview questions',
  description:
    'The SQL, pipeline design, modelling and troubleshooting questions data engineering interviews ask, and what separates a strong answer from a correct one.',
  keywords: [
    'data engineer interview questions',
    'sql interview questions data engineer',
    'data pipeline interview',
    'data modelling interview questions',
    'etl interview questions',
    'data engineer interview preparation',
    'data engineering system design',
    'idempotency interview question',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Interviews',
  anchors: ['data engineer interview', 'idempotency'],
  excerpt:
    'Data engineering interviews are unusually predictable. SQL depth, pipeline reliability and one question about a pipeline that has been quietly wrong for a month.',
  keyTakeaways: [
    'SQL filters the most candidates because it is hard to fake and predicts performance well.',
    'The idempotency question separates people who have operated pipelines from people who wrote them.',
    'In design rounds, ask about freshness before reaching for streaming — batch is right more often than chosen.',
    'Troubleshooting questions reward establishing facts before theorising.',
    'Two prepared stories — a pipeline you fixed and a quality issue you caught — cover most behavioural questions.',
  ],
  sections: [
    {
      heading: 'SQL is tested harder than candidates expect',
      paragraphs: [
        'The SQL round is where most candidates are filtered, and the reason is that it is difficult to fake and predicts job performance well. Expect problems requiring window functions, not just joins and aggregation.',
        'Interviewers are watching how you handle the awkward parts: duplicates, nulls, records arriving late, and the difference between a query that is logically right and one that will finish on a large table.',
        'Nulls deserve specific preparation because they behave unintuitively in exactly the places interviewers probe. Knowing that a null fails an equality comparison, that it is excluded by most aggregates, and that a `NOT IN` against a set containing a null returns nothing is the kind of detail that decides this round.',
      ],
      bullets: [
        'Find the most recent record per group — the classic window-function problem',
        'Compute a running total or moving average',
        'Identify gaps or overlaps in date ranges',
        'Deduplicate while keeping a specific row per key',
        'Explain why a query is slow and how you would find out',
      ],
    },
    {
      heading: 'The idempotency question',
      paragraphs: [
        'You will be asked, in some form, what happens when a pipeline is re-run. It is a favourite because it separates people who have operated pipelines from those who have only written them. Pipelines fail and get re-run constantly, and code that duplicates data on a second run causes incidents.',
        'A strong answer describes designing so that re-running produces the same result — deterministic partitions, merges keyed on a stable identifier, atomic replacement of a partition rather than appending. Mentioning that you would test this by deliberately running twice is a small detail that reads as real experience.',
        'The related question is what happens when a run is interrupted halfway. Answering that you would write to a staging location and swap atomically, so a consumer never sees a partial result, demonstrates that you have thought about the state between started and finished.',
      ],
    },
    {
      heading: 'Pipeline design rounds',
      paragraphs: [
        'You will be given a scenario — ingest from these sources, serve these consumers — and asked to design it. As with any system design round, the assessment is your reasoning rather than a specific architecture.',
        'The strongest thing you can do early is ask about freshness requirements and failure tolerance. Candidates who reach for streaming without establishing that anyone needs data within seconds reveal that they are pattern-matching. Batch is the right answer more often than it is chosen.',
        'Ask who consumes the output and what they do when it is late. A dashboard read weekly and a model retrained nightly impose completely different requirements, and designing without knowing which you are serving is how over-engineered pipelines get built.',
      ],
      bullets: [
        'How fresh does this data need to be, genuinely?',
        'What happens downstream if this pipeline is late?',
        'What if a source sends corrected records after the fact?',
        'How do we detect that output is wrong rather than absent?',
        'What is the recovery procedure when a day’s run is bad?',
      ],
      table: {
        caption: 'What each round is really assessing',
        columns: ['Round', 'Surface task', 'Assessed on'],
        rows: [
          ['SQL', 'Write the query', 'Window functions, nulls, duplicates, cost'],
          ['Idempotency', 'What if it re-runs', 'Whether you have operated a pipeline'],
          ['Design', 'Draw the architecture', 'Which questions you ask before drawing'],
          ['Modelling', 'Design the schema', 'Trade-offs for a stated access pattern'],
          ['Troubleshooting', 'Numbers look wrong', 'Method under ambiguity'],
          ['Quality', 'How do you ensure correctness', 'Whether you fail loudly or silently'],
        ],
      },
    },
    {
      heading: 'Data modelling questions',
      paragraphs: [
        'Expect questions about schema design, normalisation and when denormalising is appropriate. The unhelpful answer recites definitions; the useful one is about trade-offs for a specific access pattern.',
        'Slowly changing dimensions come up frequently and trip up candidates who have only worked with current-state data. Being able to explain how you would track a customer whose address changed, while keeping historical orders associated with the address at the time, is worth preparing properly.',
        'Partition key choice is the adjacent question and the one with the largest cost consequences. Being able to say why you would partition by event date rather than ingestion date, and what that costs when records arrive late, is a concrete answer where most candidates give a general one.',
      ],
    },
    {
      heading: 'The troubleshooting scenario',
      paragraphs: [
        'A near-universal question: a stakeholder says yesterday’s numbers look wrong. What do you do? This tests methodical thinking under ambiguity, which is most of the job.',
        'Good answers establish facts before theorising — which number, compared against what, when it last looked right — then work systematically from source to output. Weak answers jump straight to a suspected cause, which is what produces long incidents.',
        'The question people forget to ask is whether the pipeline changed or the world did. A number can move because your code broke or because the business genuinely had an unusual day, and checking that before investigating saves a surprising amount of wasted effort.',
      ],
      example: {
        title: '"Yesterday’s numbers look wrong" — a structured answer',
        paragraphs: [
          'First, make it specific: which metric, what value did they expect, and when did it last look right? "Wrong" without a comparison point is not yet a problem statement.',
          'Then check whether anything changed on our side — a deployment, a schema change, a reindex — and in parallel whether the source volume is normal. If yesterday’s input row count is half of typical, the pipeline may be fine and the source may be broken.',
          'Then work forward from source to output rather than guessing. Row counts at each stage usually localise the problem in minutes: if the count drops between two steps, that is the step.',
          'And before concluding, ask whether the world changed. A public holiday, a marketing campaign or an outage on the customer side all produce genuinely unusual numbers, and reporting a pipeline bug that was actually a quiet Tuesday is a bad outcome.',
        ],
      },
    },
    {
      heading: 'Data quality and ownership',
      paragraphs: [
        'Expect to be asked how you ensure data is correct. This is where you demonstrate seniority, because moving data is the junior version of the job and being trusted that it is right is the senior one.',
        'Talk about tests that run with the pipeline, alerting on distribution changes rather than only on failures, and documented assumptions about upstream sources. The most valuable thing to convey is that you would rather a pipeline fail loudly than silently produce wrong numbers.',
        'Freshness checks deserve a mention because they catch the failure nothing else does. A pipeline that stopped running produces no errors at all — it simply serves yesterday’s data indefinitely, and only a check on recency notices.',
      ],
      bullets: [
        'Tests on output — not null, unique, referential integrity, freshness',
        'Distribution checks that catch a source changing shape',
        'Alerting that distinguishes late from wrong',
        'Documented assumptions about what upstream guarantees',
      ],
    },
    {
      heading: 'How to prepare efficiently',
      paragraphs: [
        'Spend most of your preparation on SQL, because it carries the most weight and improves fastest with practice. Work problems until window functions are automatic rather than recalled.',
        'Then prepare two stories: a pipeline you fixed and why it broke, and a data quality issue you caught. Almost every behavioural question in this field can be answered from those two, and having them ready is worth more than broad revision.',
        'If you have no professional pipeline to draw on, build one against an awkward public API and let it fail. A source with rate limits and an occasionally changing schema gives you the same material, and interviewers care about the reasoning rather than the employer.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most important topic for a data engineer interview?',
      a: 'SQL, and by a clear margin. It carries the most weight, filters the most candidates and improves fastest with deliberate practice — particularly window functions and handling duplicates, nulls and late data.',
    },
    {
      q: 'Why do interviewers ask about idempotency?',
      a: 'Because pipelines fail and get re-run constantly. Code that duplicates or corrupts data on a second run is a common source of real incidents, so the question separates people who have operated pipelines from those who have only written them.',
    },
    {
      q: 'Should I propose streaming in a pipeline design round?',
      a: 'Only after establishing that someone genuinely needs data within seconds. Reaching for streaming unprompted signals pattern-matching; asking about freshness requirements first signals judgement. Batch is correct more often than it is chosen.',
    },
    {
      q: 'How do I answer "the numbers look wrong"?',
      a: 'Establish facts before theorising — which number, compared to what, when it was last correct — then work systematically from source to output. Jumping to a suspected cause is what makes real incidents drag on.',
    },
    {
      q: 'What SQL detail catches the most candidates?',
      a: 'Null behaviour. Nulls fail equality comparisons, are excluded by most aggregates, and make a `NOT IN` against a set containing one return nothing at all.',
    },
    {
      q: 'What if I have no professional pipeline experience?',
      a: 'Build one against an awkward public API with rate limits and a changing schema, and let it fail. It produces the same material, and interviewers assess the reasoning rather than the employer.',
    },
  ],
  related: ['data-engineer-roadmap', 'ai-engineer-interview-questions', 'cloud-engineer-roadmap'],
  references: [
    {
      title: 'PostgreSQL documentation',
      url: 'https://www.postgresql.org/docs/current/',
      publisher: 'PostgreSQL',
      note: 'Window functions, null semantics and query planning, from the primary source.',
    },
  ],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'data-engineer-roadmap',
  tint: 'emerald',
  title: 'Data Engineer Roadmap 2026: Skills, Order and Projects',
  heading: 'Data engineer roadmap',
  description:
    'What to learn to become a data engineer in 2026, in what order, which tools are worth your time, and the portfolio project that gets interviews.',
  keywords: [
    'data engineer roadmap',
    'data engineer roadmap 2026',
    'how to become a data engineer',
    'data engineering skills',
    'data engineer learning path',
    'sql for data engineers',
    'data pipeline projects',
    'data engineer portfolio',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Career Roadmaps',
  anchors: ['data engineer', 'data pipelines'],
  excerpt:
    'The tool list is long and mostly a distraction. SQL, one language, one warehouse and one orchestrator will take you further than a tour of twenty technologies.',
  keyTakeaways: [
    'SQL is the highest-return skill and the one most commonly learned to a shallow depth.',
    'Write code that runs unattended for months — idempotency is the discipline few juniors have.',
    'Learn storage concepts before tools; the tools churn and the concepts explain all of them.',
    'One warehouse, one orchestrator, one transformation tool, one cloud — depth beats breadth.',
    'Data quality is what gets you promoted. Moving data is the junior version of the job.',
  ],
  sections: [
    {
      heading: 'Learn SQL far more deeply than feels necessary',
      paragraphs: [
        'SQL is the single highest-return skill in data engineering and the one most commonly learned to a shallow depth. Being able to write a join is table stakes. Being able to read a query plan, understand why a query is slow and rewrite it is what separates candidates.',
        'Push past the comfortable plateau. Window functions, common table expressions, set operations, and the difference between what is logically correct and what executes efficiently. Interviews test this reliably because it is hard to fake and it predicts on-the-job performance well.',
        'The depth pays off twice. It gets you through the interview, and then it is what you use every day — most of the actual work of this job is expressed in SQL, and fluency is the difference between an afternoon and a week.',
      ],
      bullets: [
        'Window functions until they are second nature',
        'CTEs and recursive queries',
        'Query plans — reading them and acting on them',
        'Indexing, partitioning and why the same query behaves differently at scale',
        'Handling nulls, duplicates and late-arriving records correctly',
      ],
    },
    {
      heading: 'One language, properly',
      paragraphs: [
        'Python is the default and the right choice for almost everyone. What matters is not breadth but the ability to write code that runs unattended for months — proper error handling, logging that helps at three in the morning, idempotent operations that can be re-run safely.',
        'That last property deserves particular attention. Pipelines fail and get re-run constantly. Code that produces duplicates or corrupts state on a second run is the most common source of data quality incidents, and writing idempotent jobs is a learnable discipline that few juniors have.',
        'A useful test of your own code: could it be run twice in a row, or interrupted halfway and restarted, without anyone needing to clean up afterwards? If the honest answer is no, that is the gap worth closing before learning another tool.',
      ],
    },
    {
      heading: 'Understand storage before tools',
      paragraphs: [
        'Most roadmaps jump straight to naming technologies. Understand the concepts first and the tools become interchangeable, which is exactly the position you want given how quickly the tool landscape churns.',
        'The concepts are not numerous. Why columnar storage makes analytical queries fast. What partitioning does and how to choose a partition key. Why file formats matter. What a table format adds over raw files. These explain the behaviour of every tool you will use.',
        'Partitioning deserves the most attention because it is where the largest and most avoidable cost differences appear. A well-chosen partition key can reduce a query from scanning a terabyte to scanning a gigabyte, and a badly chosen one produces a table nobody can query economically.',
      ],
      bullets: [
        'Row versus columnar storage, and which workload each suits',
        'Partitioning strategy and its effect on query cost',
        'File formats and compression trade-offs',
        'Table formats — schema evolution, time travel, concurrent writes',
        'Batch versus streaming, and when streaming is genuinely warranted',
      ],
    },
    {
      heading: 'Pick one of each and go deep',
      paragraphs: [
        'You need one warehouse, one orchestrator, one transformation tool and one cloud. Which specific ones matters far less than knowing one set properly, because the concepts transfer and employers know this.',
        'A candidate who has genuinely operated one orchestrator — including the failures, the backfills, the dependency problems — interviews better than one who has completed tutorials in four. Depth is legible in a way breadth is not.',
        'If you have no constraint, pick whatever is most used in the market you are applying to. The learning transfers either way, and starting with the one that appears in local job postings removes a small but real barrier from every application.',
      ],
      bullets: [
        'A warehouse or lakehouse platform',
        'An orchestrator, including how it behaves when tasks fail',
        'A transformation framework with testing and documentation',
        'One cloud provider, to working familiarity',
        'Version control and CI applied to data work, not just to application code',
      ],
      table: {
        caption: 'A realistic sequence, with what completion looks like',
        columns: ['Stage', 'Rough time', 'Done when'],
        rows: [
          ['SQL to depth', '2–3 months', 'You can read a plan and fix a slow query'],
          ['Python for pipelines', '2 months', 'Your jobs are safely re-runnable'],
          ['Storage concepts', '3–4 weeks', 'You can justify a partition key'],
          ['One warehouse', '1 month', 'You have loaded and queried real volume'],
          ['One orchestrator', '1–2 months', 'You have handled a failure and a backfill'],
          ['Data quality practice', 'Ongoing', 'Your pipeline fails loudly, not silently'],
        ],
      },
    },
    {
      heading: 'Data quality is the part that gets you promoted',
      paragraphs: [
        'Moving data is the junior version of the job. The senior version is being trusted that the data is correct, which means tests, monitoring, documented assumptions and knowing what breaks when an upstream source changes without warning.',
        'Learn to write data tests as a matter of habit — not null, unique, referential integrity, distribution checks, freshness. Pipelines that fail loudly are vastly better than pipelines that quietly produce wrong numbers, and the difference is a career-defining distinction.',
        'Freshness checks are the most underrated of these. A pipeline that stopped running produces no errors and no alerts; it simply serves yesterday’s data indefinitely, and somebody makes a decision on it three weeks later.',
      ],
    },
    {
      heading: 'The project that actually gets interviews',
      paragraphs: [
        'One pipeline that runs on a schedule, handles failure, tests its own output and is documented beats five notebooks. It should ingest from a real source, transform with tests, load into a warehouse and be orchestrated rather than run by hand.',
        'Write up what broke and how you handled it. That paragraph is the most persuasive part of any data engineering portfolio, because everyone who has done the job knows that handling failure is the job.',
        'Pick a source that is genuinely awkward. A public API with rate limits, inconsistent schemas and occasional outages teaches more and demonstrates more than a clean CSV, and it gives you something specific to talk about for twenty minutes.',
      ],
      example: {
        title: 'What makes a pipeline project credible',
        paragraphs: [
          'Thin: "Built an ETL pipeline using Airflow and dbt to load data into Snowflake." Nothing here indicates whether it ever ran twice.',
          'Credible: "Ingests a public transport API every fifteen minutes. The API silently returns partial data during outages, so the loader compares record counts against a rolling median and quarantines suspicious batches rather than merging them. Schema changed twice in three months; both times the freshness test caught it before the downstream table was wrong. Backfilled six weeks after a failure by re-running the same idempotent job."',
          'The second version demonstrates idempotency, data quality testing, freshness monitoring and backfill handling — the four things the role is actually about — without claiming any scale it did not have.',
        ],
      },
    },
    {
      heading: 'How AI changed this role',
      paragraphs: [
        'Less than feared and more than expected. Writing routine transformations is faster with assistance, which compresses the value of the mechanical parts. But AI systems consume enormous quantities of well-prepared data, and retrieval pipelines are data pipelines with a different destination.',
        'The practical move is to add retrieval and embedding pipelines to your skill set. It is a short step from conventional data engineering and it puts you in front of roles that pay a premium for the overlap.',
        'The concepts map more directly than most people expect. Chunking is partitioning, embedding is a transformation step, an index rebuild is a backfill, and a stale index is a freshness problem. The discipline you already have is most of what is needed.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How long does it take to become a data engineer?',
      a: 'From scratch with consistent effort, roughly nine to eighteen months to be employable. From an adjacent role such as analyst or backend developer, often six months or less, because SQL or engineering practice is already in place.',
    },
    {
      q: 'Which is more important, SQL or Python?',
      a: 'SQL, comfortably. It is used more heavily, tested more rigorously in interviews and harder to fake. Python matters for pipeline code, but weak SQL will end an interview faster than weak Python.',
    },
    {
      q: 'Do I need to learn streaming?',
      a: 'Not to get hired. Most work is batch, and many streaming implementations exist where batch would have served better. Learn batch properly first, then streaming when a real requirement calls for it.',
    },
    {
      q: 'Is data engineering at risk from AI?',
      a: 'The mechanical parts are being compressed, but demand for well-prepared data has grown because AI systems consume so much of it. Adding retrieval and embedding pipelines is a short step that keeps you on the growing side.',
    },
    {
      q: 'What is idempotency and why does it matter so much?',
      a: 'It means a job can be re-run safely without duplicating or corrupting anything. Pipelines fail and get re-run constantly, and non-idempotent code is the most common source of data quality incidents.',
    },
    {
      q: 'Which tools should I choose?',
      a: 'Whichever appear in job postings where you are applying. The concepts transfer between all of them, so depth in one set beats a tour of many — and matching the local market removes a small barrier.',
    },
  ],
  related: ['data-engineer-interview-questions', 'cloud-engineer-roadmap', 'postgresql-pgvector-for-ai-job-search'],
  references: [
    {
      title: 'PostgreSQL documentation',
      url: 'https://www.postgresql.org/docs/current/',
      publisher: 'PostgreSQL',
      note: 'Primary reference for indexing, transactions and query planning.',
    },
    {
      title: 'Full text search',
      url: 'https://www.postgresql.org/docs/current/textsearch.html',
      publisher: 'PostgreSQL',
      note: 'What Postgres can do before you add a search engine.',
    },
  ],
};

export default post;

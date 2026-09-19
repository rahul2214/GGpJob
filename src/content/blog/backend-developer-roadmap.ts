import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'backend-developer-roadmap',
  tint: 'emerald',
  title: 'Backend Developer Roadmap 2026',
  heading: 'Backend developer roadmap',
  description:
    'A practical backend path for 2026: databases before frameworks, API design, auth, concurrency, observability, and the project that gets you interviews.',
  keywords: [
    'backend developer roadmap',
    'backend roadmap 2026',
    'how to become a backend developer',
    'backend developer skills',
    'api design skills',
    'database skills for backend',
    'backend portfolio project',
    'backend interview preparation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Career Roadmaps',
  excerpt:
    'Backend interviews are mostly databases, failure handling and design judgement. Framework knowledge is assumed and rarely decides anything.',
  sections: [
    {
      heading: 'The database is the job',
      paragraphs: [
        'Almost every backend performance problem is a query problem, and almost every correctness problem is a data-modelling problem. Yet most self-taught backend developers know an ORM and cannot say what it generates, which surfaces in the first technical interview.',
        'Learn SQL directly. Schema design, normalisation and when to break it deliberately, indexes and why the wrong one does nothing, transactions and isolation levels, and reading a query plan to find what is slow. This single area carries more interview weight than any framework.',
      ],
      bullets: [
        'SQL written by hand, including joins that are not trivial',
        'Indexing — what it accelerates and what it cannot',
        'Transactions and isolation, at a working level',
        'Reading a query plan and acting on it',
        'Migrations that run safely against a live table',
      ],
    },
    {
      heading: 'API design that survives a second consumer',
      paragraphs: [
        'Anyone can expose an endpoint. The skill is designing a contract that can change without breaking callers: sensible resources, predictable errors, pagination that works on page 900, and versioning decided before you need it rather than after.',
        'Error responses deserve more thought than they get. A caller needs to know whether to retry, whether to fix the request, or whether to give up — and a body saying "something went wrong" answers none of those.',
      ],
    },
    {
      heading: 'Authentication and authorisation, done once properly',
      paragraphs: [
        'Build auth correctly one time and the understanding transfers everywhere. Sessions versus tokens and the real trade-off, password hashing, refresh and revocation, and the distinction between proving who someone is and deciding what they may do.',
        'Authorisation is where real breaches live. The common failure is checking permission in the interface and not in the endpoint, so the object is reachable by anyone who guesses the id. Interviewers ask about this precisely because it is so frequently missed.',
      ],
    },
    {
      heading: 'Failure is the normal case',
      paragraphs: [
        'Junior backend code assumes the network works, the third party responds and the job runs once. Production code assumes none of that. Timeouts, retries with backoff, idempotency so a retry is safe, and circuit breaking so one slow dependency does not take the service down.',
        'Idempotency is the concept worth internalising early. If a payment endpoint is called twice because a client retried on a timeout, does the customer get charged twice? Being able to answer that concretely marks you as someone who has thought about production.',
      ],
      bullets: [
        'Timeouts on every outbound call, always',
        'Retries with backoff, and knowing what is unsafe to retry',
        'Idempotency keys for anything that changes state',
        'Graceful degradation when a dependency is down',
        'Structured logs that let you reconstruct one request',
      ],
    },
    {
      heading: 'Enough concurrency to not be dangerous',
      paragraphs: [
        'You do not need deep theory, but you need to recognise the shapes: race conditions on read-modify-write, the difference between blocking and waiting on input/output, connection pool exhaustion, and why a background job that runs twice must not corrupt anything.',
        'The practical version of this knowledge is knowing which operations need a lock or a transaction and which do not, and being able to explain why the naive version of a counter increment is wrong.',
      ],
    },
    {
      heading: 'What to build',
      paragraphs: [
        'One service with a real database, real authentication, tests, and at least one integration with something outside itself — a payment sandbox, an email provider, a third-party API. The external dependency is what forces you to handle failure honestly.',
        'Deploy it, add logging and a health check, then deliberately break the dependency and make the service degrade rather than collapse. Being able to walk an interviewer through that is worth more than a longer feature list.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Which backend language should I learn first?',
      a: 'Any mainstream one, learned properly — the concepts transfer almost entirely. Pick by the hiring market where you want to work, then spend your effort on databases and system design rather than on a second language.',
    },
    {
      q: 'Is SQL still important with modern ORMs?',
      a: 'More than ever. An ORM writes the query but you debug it, and the slow endpoint is nearly always a query problem. Not being able to read what your ORM generates is a common interview failure.',
    },
    {
      q: 'What do backend interviews actually test?',
      a: 'SQL depth, API and data modelling judgement, how you handle failure and concurrency, and whether you distinguish authentication from authorisation. Framework specifics come up far less than candidates expect.',
    },
    {
      q: 'What project best demonstrates backend skill?',
      a: 'A service with a real database, real auth, tests and one external integration — then break that integration deliberately and make it degrade gracefully. Handling failure is the part that reads as professional.',
    },
  ],
  related: ['frontend-developer-roadmap', 'full-stack-developer-roadmap', 'data-engineer-roadmap'],
};

export default post;

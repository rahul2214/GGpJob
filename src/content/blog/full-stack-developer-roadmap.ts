import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'full-stack-developer-roadmap',
  tint: 'emerald',
  title: 'Full Stack Developer Roadmap 2026',
  heading: 'Full stack developer roadmap',
  description:
    'A focused full stack path for 2026: fundamentals over frameworks, one stack learned properly, databases, auth, deployment, and the projects that get interviews.',
  keywords: [
    'full stack developer roadmap',
    'full stack roadmap 2026',
    'how to become a full stack developer',
    'full stack developer skills',
    'web developer roadmap',
    'full stack projects',
    'frontend backend learning path',
    'full stack portfolio',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Career Roadmaps',
  anchors: ['full stack developer', 'full stack'],
  excerpt:
    'The roadmap problem is that every list has ninety items. Almost all hiring rests on maybe fifteen of them, learned well.',
  keyTakeaways: [
    'Frameworks change every few years; HTTP, the browser and the language barely move.',
    'One stack learned deeply beats three learned shallowly — switching repeatedly is the classic two-year mistake.',
    'Databases are where juniors are weakest, and the slow endpoint is nearly always a query problem.',
    'Build authentication properly once; the security thinking transfers everywhere.',
    'Two or three substantial deployed projects beat a dozen tutorials.',
  ],
  sections: [
    {
      heading: 'Fundamentals outlast frameworks',
      paragraphs: [
        'Frameworks change every few years; the layer beneath them barely moves. Developers who understand HTTP, the browser and the language adapt to a new framework in weeks. Developers who only know a framework start over each time.',
        'This is the single most consequential decision in how you spend your learning time. Spend it disproportionately on the parts that will still be true in ten years.',
        'It is also the difference between debugging and guessing. When a request behaves unexpectedly, understanding caching headers, cookies and status codes gives you a place to look; framework knowledge alone gives you a search query.',
      ],
      bullets: [
        'HTTP — methods, status codes, headers, caching, cookies',
        'How a browser turns a request into pixels, and what blocks it',
        'JavaScript itself — closures, promises, the event loop, modules',
        'The DOM, independent of any framework',
        'Accessibility basics, which are increasingly a legal requirement',
      ],
    },
    {
      heading: 'One stack, properly',
      paragraphs: [
        'Choose one frontend framework and one backend language and go deep. Jumping between stacks is the most common way to spend two years and remain unemployable, because nothing reaches the depth an interview probes.',
        'Deep means understanding the model rather than memorising the API: how rendering and state updates actually work, why an effect runs when it does, what happens on the server versus the client. That understanding is what lets you debug rather than guess.',
        'The anxiety about choosing the wrong one is misplaced. Hiring managers care that you can reason about a system, and someone fluent in one modern stack is trusted to pick up another — which is exactly what happens on the job anyway.',
      ],
    },
    {
      heading: 'Databases are where juniors are weakest',
      paragraphs: [
        'Most self-taught developers can use an ORM and cannot explain what it generates. That gap appears immediately in interviews and in production, where the slow endpoint is nearly always a query problem.',
        'Learn SQL directly, not only through an abstraction. Schema design, normalisation and when to break it, indexes and why the wrong one is useless, transactions, and how to find the query making a page slow.',
        'The specific thing worth being able to spot is a query running once per row of a previous result. It is the most common performance defect in application code, it is invisible until you look at what the ORM emitted, and naming it in an interview signals real experience.',
      ],
      bullets: [
        'SQL written by hand, not only generated',
        'Schema design and sensible relationships',
        'Indexing — what it does and when it does nothing',
        'Transactions and isolation, at a working level',
        'Reading a query plan to find what is slow',
      ],
      table: {
        caption: 'Where hiring actually concentrates, against roadmap length',
        columns: ['Area', 'Roadmap emphasis', 'Interview emphasis'],
        rows: [
          ['Framework API surface', 'Very high', 'Low'],
          ['Language and browser fundamentals', 'Low', 'High'],
          ['SQL and data modelling', 'Low', 'High'],
          ['Authentication and authorisation', 'Low', 'Moderate to high'],
          ['Deployment and environments', 'Low', 'Moderate'],
          ['Testing', 'Low', 'Moderate, rising with seniority'],
          ['Tooling breadth', 'High', 'Very low'],
        ],
      },
    },
    {
      heading: 'Authentication, done properly once',
      paragraphs: [
        'Auth appears in essentially every application and is implemented badly in most portfolio projects. Building it correctly once — sessions or tokens, password hashing, refresh handling, authorisation distinct from authentication — teaches security thinking that transfers everywhere.',
        'Know the difference between authentication and authorisation and be able to state it crisply. Confusing the two is a common interview stumble and a common source of real vulnerabilities.',
        'The failure worth understanding deeply is the missing ownership check: an endpoint that verifies who you are and never verifies that the record belongs to you. It is the most common serious vulnerability in applications built by capable developers, precisely because the authentication part looks correct.',
      ],
    },
    {
      heading: 'Ship it, because deployment teaches what local never does',
      paragraphs: [
        'A project that only runs on your machine is half a project. Deploying forces you to confront environment configuration, secrets, build steps, database migrations and the first time something works locally and fails in production.',
        'You do not need sophisticated infrastructure. A managed platform is fine. What matters is that the application is reachable, that you configured it, and that you can explain what happens between a commit and the running site.',
        'The lessons arrive quickly and stick. Secrets that should not be in the repository, a migration that ran in the wrong order, a build that succeeded locally because of a file you never committed — each of these is a half hour of frustration and a permanent piece of understanding.',
      ],
    },
    {
      heading: 'The portfolio that works',
      paragraphs: [
        'Two or three substantial projects beat a dozen tutorials. Substantial means real authentication, a database with meaningful relationships, some tests, deployment and a README that explains decisions rather than listing features.',
        'Build something with an actual user, even one — a tool you or someone you know uses. Projects with a real user have edge cases, feedback and decisions to defend, which is precisely what interviewers dig into and what clone projects cannot provide.',
        'Write the README for a reviewer who has ten minutes. What it does, why you chose the stack, one thing that was harder than expected and how you resolved it. That last paragraph is read more carefully than any of the code.',
      ],
      bullets: [
        'Real auth, not a hardcoded login',
        'A database with relationships and constraints',
        'Tests covering the parts that matter',
        'Deployed and reachable',
        'A README explaining why, not just what',
      ],
      example: {
        title: 'Two portfolios, same effort',
        paragraphs: [
          'Portfolio A: eleven repositories. A weather app, a to-do list, three tutorial clones, a calculator. All frontend-only, none deployed, READMEs listing features. A reviewer learns that the candidate can follow instructions.',
          'Portfolio B: two projects. One is a booking tool a local club actually uses — real auth, a schema with constraints, an admin view, deployed, with a README describing why bookings are stored as a range rather than a start time and what broke when two people booked simultaneously.',
          'The second candidate has fewer lines of code and vastly more to talk about. The concurrency bug alone is worth fifteen minutes of interview, and it is something no tutorial would have produced.',
        ],
      },
    },
    {
      heading: 'What AI changed about this path',
      paragraphs: [
        'Boilerplate is faster to produce, which reduces the value of memorising syntax and raises the value of judgement: knowing what to build, recognising when generated code is wrong, and owning what ships.',
        'The practical consequence for a learner is that reading code critically matters more than it used to. Accepting generated code you cannot explain builds an impressive-looking repository and no actual capability — and interviews find that out quickly.',
        'The safest way to use these tools while learning is to write the first version yourself, then ask for a critique. That preserves the struggle that builds understanding while still getting the benefit of a second opinion on structure.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How long does the full stack path take?',
      a: 'With consistent daily effort, typically nine to eighteen months to junior-employable. The main accelerator is depth in one stack; the main delay is switching stacks repeatedly before reaching interview-level understanding in any.',
    },
    {
      q: 'Should I learn frontend or backend first?',
      a: 'Frontend first suits most people because feedback is visible and motivating. What matters more is not stopping there — the full stack label requires being genuinely competent on both sides, especially with databases.',
    },
    {
      q: 'How many projects do I need in a portfolio?',
      a: 'Two or three substantial ones, not a dozen small ones. Real authentication, a database with relationships, tests, deployment and a README explaining your decisions outperform quantity every time.',
    },
    {
      q: 'Is full stack development still a good career with AI coding tools?',
      a: 'Yes, though the emphasis shifts. Producing boilerplate is cheaper, so judgement, debugging and system design matter more. Developers who can explain and defend what they ship remain in demand.',
    },
    {
      q: 'What is the most common serious bug juniors ship?',
      a: 'A missing ownership check — an endpoint that verifies who you are but never that the record belongs to you. The authentication looks correct, which is exactly why it survives review.',
    },
    {
      q: 'How should I use AI tools while still learning?',
      a: 'Write the first version yourself, then ask for a critique. That keeps the struggle that builds understanding while still getting a second opinion on structure.',
    },
  ],
  related: ['frontend-developer-roadmap', 'backend-developer-roadmap', 'python-developer-roadmap'],
  references: [
    {
      title: 'HTTP',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
      publisher: 'MDN Web Docs',
      note: 'The reference for methods, status codes, headers and caching.',
    },
    {
      title: 'Web security',
      url: 'https://developer.mozilla.org/en-US/docs/Web/Security',
      publisher: 'MDN Web Docs',
      note: 'Browser-side security concepts, including headers and same-origin rules.',
    },
    {
      title: 'PostgreSQL documentation',
      url: 'https://www.postgresql.org/docs/current/',
      publisher: 'PostgreSQL',
      note: 'Primary reference for indexing, transactions and query planning.',
    },
  ],
};

export default post;

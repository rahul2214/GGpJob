import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'nextjs-16-for-developers',
  tint: 'indigo',
  title: 'Next.js 16 for Developers: The Parts That Matter',
  heading: 'Next.js 16 for developers',
  description:
    'What matters in modern Next.js: the App Router model, caching you can reason about, server actions, and the decisions that actually affect performance.',
  keywords: [
    'nextjs 16',
    'next js app router',
    'nextjs server actions',
    'nextjs caching explained',
    'next js 16 features',
    'nextjs interview questions',
    'learn nextjs 2026',
    'nextjs performance',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Developer Tech',
  excerpt:
    'Most Next.js difficulty comes from one thing: not knowing where your code runs or when it is cached. Get those two right and the rest is ordinary React.',
  sections: [
    {
      heading: 'Two questions explain most confusion',
      paragraphs: [
        'Nearly every Next.js problem people bring to a colleague reduces to one of two questions: where does this code run, and when was this output cached? Developers who can answer both for any line of their application rarely get stuck.',
        'The framework has become more explicit about both over successive versions, which is good but means the mental model matters more, not less. Copying patterns without understanding them produces applications that work locally and behave strangely in production.',
      ],
    },
    {
      heading: 'The App Router model',
      paragraphs: [
        'The App Router builds directly on React Server Components, so the boundary discussion from React applies here first. Files are server-side by default, and interactivity is opted into deliberately.',
        'The conventions carry real meaning rather than being naming ceremony. Layouts persist across navigation and do not re-render, which is why putting request-specific logic in one causes confusing staleness. Loading and error files define Suspense and error boundaries implicitly.',
      ],
      bullets: [
        'Server by default; client components opted into explicitly',
        'Layouts persist across navigation — state in them survives',
        'Loading files create Suspense boundaries for free',
        'Error files scope error boundaries to a segment',
        'Route handlers for API endpoints, separate from page rendering',
      ],
    },
    {
      heading: 'Caching is the part that bites',
      paragraphs: [
        'The caching model is the single most common source of production surprises. Data that should be fresh is stale; pages that should be static are rendered per request; a deployment behaves differently from local development because development disables much of it.',
        'The way to stay out of trouble is to be deliberate rather than implicit. Decide for each data dependency whether it can be cached, for how long, and what should invalidate it — and write that decision down in the code rather than relying on defaults you have not read.',
      ],
    },
    {
      heading: 'Server actions, and where to be careful',
      paragraphs: [
        'Server actions let a client component invoke server code without writing an endpoint. They remove a lot of ceremony for forms and mutations, and they pair naturally with the React Actions model.',
        'The security point is easy to miss: a server action is a public endpoint. It does not matter that it is only called from one component behind a permission check, because the endpoint can be invoked directly. Every action needs its own authentication and authorisation, exactly as an API route would.',
      ],
      bullets: [
        'Authenticate and authorise inside every action, not only in the caller',
        'Validate inputs — the caller is not the only possible caller',
        'Keep secrets in the action, never passed in as props',
        'Revalidate affected caches deliberately after a mutation',
      ],
    },
    {
      heading: 'What actually affects performance',
      paragraphs: [
        'The biggest wins are usually structural rather than configuration. Shrinking the client boundary so less JavaScript ships. Avoiding sequential data fetches that could run in parallel. Streaming so the page is useful before every dependency resolves.',
        'Image and font handling deserve attention because they dominate perceived load time on real connections, and the framework handles both well if you use the provided components rather than raw tags.',
      ],
    },
    {
      heading: 'What interviews ask',
      paragraphs: [
        'Expect questions about where code runs, how you would cache a specific piece of data and why, and how you would secure a server action. These separate candidates who have shipped a Next.js application from those who have followed a tutorial.',
        'A strong answer to the security question in particular — recognising unprompted that a server action is a public endpoint — signals real production experience more reliably than listing features.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the hardest part of Next.js to learn?',
      a: 'Caching. Knowing when output is cached, for how long and what invalidates it causes more production surprises than anything else, partly because development mode behaves differently from production.',
    },
    {
      q: 'Are server actions secure by default?',
      a: 'No. A server action is a publicly reachable endpoint regardless of which component calls it. Authenticate, authorise and validate inputs inside every action, exactly as you would for an API route.',
    },
    {
      q: 'Should I use the App Router or the Pages Router?',
      a: 'App Router for new work — it is where development is focused and it matches the React Server Components model. Existing Pages Router applications do not need urgent migration and the two can coexist.',
    },
    {
      q: 'What improves Next.js performance most?',
      a: 'Structural changes rather than configuration: shrinking the client boundary so less JavaScript ships, parallelising data fetches that were sequential, and streaming so the page is useful before everything resolves.',
    },
  ],
  related: ['react-19-for-developers', 'full-stack-developer-roadmap', 'vibe-coding'],
};

export default post;

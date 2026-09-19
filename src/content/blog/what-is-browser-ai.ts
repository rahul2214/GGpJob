import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-browser-ai',
  tint: 'sky',
  title: 'What Is Browser AI?',
  heading: 'Browser AI, explained',
  description:
    'What browser AI means, how an AI that drives a browser differs from a scraper, why it is slow and expensive, and where it is genuinely the right tool.',
  keywords: [
    'what is browser ai',
    'browser ai agent',
    'ai that controls browser',
    'browser automation ai',
    'ai web agent',
    'browser agent explained',
    'ai clicking buttons',
    'web automation with ai',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A browser AI uses a website the way you do — badly, slowly and expensively. That is the point, and also the reason to avoid it where you can.',
  sections: [
    {
      heading: 'The definition',
      paragraphs: [
        'Browser AI is a model driving a real web browser: reading the page, deciding what to do, clicking, typing, scrolling, and reading what happened next. It operates the interface built for humans rather than an interface built for programs.',
        'That is the entire distinction from conventional automation. A scraper is told where things are; a browser agent works out where things are. One breaks when the page changes; the other adapts, at considerable cost.',
      ],
    },
    {
      heading: 'How it differs from a scraper',
      paragraphs: [
        'A traditional script encodes a path: find this selector, click it, read that element. It is fast, cheap and completely deterministic — and it breaks the moment a class name changes.',
        'A browser agent is given a goal. It looks at the page, reasons about which element probably does what it needs, and tries. When the layout changes it usually still works, because it was never depending on the layout in the first place.',
      ],
      bullets: [
        'Scraper: fast, cheap, deterministic, brittle to any change',
        'Browser agent: slow, expensive, adaptive, non-deterministic',
        'Scraper: fails loudly when a selector is missing',
        'Browser agent: may quietly do the wrong thing instead of failing',
      ],
    },
    {
      heading: 'How the model sees the page',
      paragraphs: [
        'There are two approaches and they trade off sharply. One feeds a processed version of the page structure — the accessibility tree or a simplified DOM — which is compact and cheap but loses visual meaning. The other feeds a screenshot, which captures what a human sees but costs far more tokens per step.',
        'Most production systems use the structural approach with screenshots as a fallback for pages where layout carries meaning. Understanding this trade-off explains most of the cost and latency differences between tools.',
      ],
    },
    {
      heading: 'Why it is slow and expensive',
      paragraphs: [
        'Every step is a model call. Look at page, decide, act, observe result — and a form with eight fields is potentially eight or more round trips, each costing tokens and seconds.',
        'This is why browser agents are reserved for cases where nothing better exists. If there is an API, use the API. It will be a hundred times faster, cost almost nothing, and fail in ways you can predict.',
      ],
    },
    {
      heading: 'Where it earns its cost',
      paragraphs: [
        'The genuine use case is the long tail: a task spread across many sites that each do things slightly differently, where writing and maintaining a script per site would cost more than the automation saves.',
        'Job applications are close to the ideal example. Thousands of employers, several applicant tracking systems, endless variation in form fields, and no useful API for most of them. Writing a scraper per employer is impossible; a system that can read a form and work out what it is asking is the only approach that scales.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between browser AI and web scraping?',
      a: 'A scraper is told exactly where things are and breaks when the page changes. A browser agent is given a goal and works out where things are, so it adapts — at far higher cost and much lower speed.',
    },
    {
      q: 'Does a browser agent see the page like a human?',
      a: 'Sometimes. Most use a processed structure such as the accessibility tree, which is compact and cheap; screenshots capture visual meaning but cost far more per step. Many systems combine both.',
    },
    {
      q: 'Why not use browser AI for everything?',
      a: 'Every step is a model call, so it is orders of magnitude slower and more expensive than an API call. If an API exists, use it — the agent is for when nothing better is available.',
    },
    {
      q: 'What is browser AI genuinely good for?',
      a: 'Long-tail tasks spread across many sites that each behave slightly differently, where maintaining a script per site would cost more than the automation saves. Job application forms are a near-perfect example.',
    },
  ],
  related: ['what-is-computer-using-ai', 'browser-automation-vs-ai-browser-agents', 'how-ai-agents-understand-web-pages'],
};

export default post;

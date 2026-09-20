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
  anchors: ['browser AI', 'browser agent'],
  excerpt:
    'A browser AI uses a website the way you do — badly, slowly and expensively. That is the point, and also the reason to avoid it where you can.',
  keyTakeaways: [
    'A scraper is told where things are; a browser agent works out where things are.',
    'The adaptability is bought with cost, latency and non-determinism.',
    'Structural page representations are cheap; screenshots capture visual meaning and cost far more.',
    'Every step is a model call, so an eight-field form is eight or more round trips.',
    'It earns its cost on long-tail tasks across many sites where per-site scripts cost more than they save.',
  ],
  sections: [
    {
      heading: 'The definition',
      paragraphs: [
        'Browser AI is a model driving a real web browser: reading the page, deciding what to do, clicking, typing, scrolling, and reading what happened next. It operates the interface built for humans rather than an interface built for programs.',
        'That is the entire distinction from conventional automation. A scraper is told where things are; a browser agent works out where things are. One breaks when the page changes; the other adapts, at considerable cost.',
        'The framing that helps is to think of it as hiring a temp rather than writing a macro. A macro does exactly what you specified and nothing else; a temp works out what you meant, occasionally gets it wrong, and costs considerably more per task.',
      ],
    },
    {
      heading: 'How it differs from a scraper',
      paragraphs: [
        'A traditional script encodes a path: find this selector, click it, read that element. It is fast, cheap and completely deterministic — and it breaks the moment a class name changes.',
        'A browser agent is given a goal. It looks at the page, reasons about which element probably does what it needs, and tries. When the layout changes it usually still works, because it was never depending on the layout in the first place.',
        'The failure modes are opposite, and that difference matters more than the cost. A scraper stops when it cannot find something, which is loud and obvious; an agent picks the nearest plausible element and continues, which is quiet and sometimes wrong.',
      ],
      bullets: [
        'Scraper: fast, cheap, deterministic, brittle to any change',
        'Browser agent: slow, expensive, adaptive, non-deterministic',
        'Scraper: fails loudly when a selector is missing',
        'Browser agent: may quietly do the wrong thing instead of failing',
      ],
      table: {
        caption: 'Which approach fits which situation',
        columns: ['Situation', 'Use', 'Why'],
        rows: [
          ['An API exists', 'The API', 'Orders of magnitude faster and cheaper'],
          ['One site, stable layout', 'Scraper', 'Deterministic and nearly free'],
          ['Many sites, all different', 'Browser agent', 'Per-site scripts cost more than they save'],
          ['Layout changes often', 'Browser agent', 'Adapts without maintenance'],
          ['Action is irreversible', 'Either, plus a human gate', 'Neither should submit unsupervised'],
        ],
      },
    },
    {
      heading: 'How the model sees the page',
      paragraphs: [
        'There are two approaches and they trade off sharply. One feeds a processed version of the page structure — the accessibility tree or a simplified DOM — which is compact and cheap but loses visual meaning. The other feeds a screenshot, which captures what a human sees but costs far more tokens per step.',
        'Most production systems use the structural approach with screenshots as a fallback for pages where layout carries meaning. Understanding this trade-off explains most of the cost and latency differences between tools.',
        'A pleasing side effect is that sites built properly for screen readers are the easiest for agents to operate. The accessibility tree is exactly what a browser already produces for assistive technology, so accessibility work done for people turns out to be what makes automation reliable.',
      ],
    },
    {
      heading: 'Why it is slow and expensive',
      paragraphs: [
        'Every step is a model call. Look at page, decide, act, observe result — and a form with eight fields is potentially eight or more round trips, each costing tokens and seconds.',
        'This is why browser agents are reserved for cases where nothing better exists. If there is an API, use the API. It will be a hundred times faster, cost almost nothing, and fail in ways you can predict.',
        'The cost also compounds with verification, which is not optional. An agent that does not re-read the page after each action cannot tell whether the click landed, and the verification roughly doubles the number of calls — which is worth paying and worth budgeting for.',
      ],
    },
    {
      heading: 'What it is allowed to do matters more than what it can do',
      paragraphs: [
        'A browser agent reads pages written by other people and can act on what it finds. That combination is the precondition for indirect prompt injection: text on a page can address the agent rather than the reader, and the agent has no reliable way to tell the difference.',
        'The mitigation is structural rather than a better instruction. Keep the component that reads pages separate from the component that can submit, restrict which hosts it can reach, and require a person to confirm anything irreversible.',
        'This is also why "it can do anything a human can" is a warning rather than a feature. The useful version of a browser agent is one whose capabilities have been deliberately narrowed to the task, so that being persuaded gets it nowhere.',
      ],
    },
    {
      heading: 'Why they still get things wrong',
      paragraphs: [
        'The failures are consistent enough to list, and almost none of them are the model failing to reason. Most are timing: the agent captured the page a few hundred milliseconds before it finished rendering, so it is deciding about a layout that no longer exists by the time it acts.',
        'The rest are representation problems. A control built from divs reports no role, so it appears as an unlabelled element among six others. A cookie banner or modal intercepts the click. An element exists in the page structure but is scrolled out of view and cannot actually be clicked.',
        'The mitigations are unglamorous and effective: wait for the page to settle before capturing, re-capture after every action, and verify that the expected change occurred rather than assuming the click landed. That roughly doubles the interactions, which is the cost of not being confidently wrong.',
      ],
      bullets: [
        'A stale capture taken before the page finished rendering',
        'Custom components that report no role or accessible name',
        'Overlays and consent banners intercepting the click',
        'Elements present in the structure but outside the viewport',
        'Content that loads only after a scroll or an interaction',
      ],
    },
    {
      heading: 'Where it earns its cost',
      paragraphs: [
        'The genuine use case is the long tail: a task spread across many sites that each do things slightly differently, where writing and maintaining a script per site would cost more than the automation saves.',
        'Job applications are close to the ideal example. Thousands of employers, several applicant tracking systems, endless variation in form fields, and no useful API for most of them. Writing a scraper per employer is impossible; a system that can read a form and work out what it is asking is the only approach that scales.',
        'Even there, the economics improve with memory. Learning a site’s form layout once and replaying it deterministically afterwards — falling back to reasoning only when the page changes — turns an expensive approach into an affordable one over repeated use.',
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
    {
      q: 'Is a browser agent a security risk?',
      a: 'It reads pages written by strangers and can act on them, which is the precondition for indirect injection. Separate reading from acting, restrict reachable hosts, and gate anything irreversible behind a person.',
    },
    {
      q: 'Can the cost be reduced?',
      a: 'Yes, with memory. Learn a site’s form layout once, replay it deterministically, and fall back to reasoning only when the page changes — which makes repeated use far cheaper than the first run.',
    },
  ],
  related: ['what-is-computer-using-ai', 'browser-automation-vs-ai-browser-agents', 'how-ai-agents-understand-web-pages'],
};

export default post;

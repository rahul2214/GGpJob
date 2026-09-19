import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-browser-agent-with-mcp',
  tint: 'rose',
  title: 'How to Build an AI Browser Agent With MCP',
  heading: 'A browser agent behind MCP',
  description:
    'Exposing browser control as MCP tools: what to expose and what to withhold, keeping page content untrusted, session scoping and enforcing limits server-side.',
  keywords: [
    'mcp browser agent',
    'browser control mcp server',
    'mcp tool design',
    'untrusted page content',
    'agent session scoping',
    'mcp limits enforcement',
    'browser automation protocol',
    'agent safety mcp',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Publishing browser control as MCP tools means an agent you did not write can drive a browser you are responsible for.',
  sections: [
    {
      heading: 'What the protocol changes',
      paragraphs: [
        'Wrapping browser control in MCP separates the driving model from the browser runtime. Any compatible client can then operate it, and you can swap models without touching the automation layer.',
        'That separation is also the whole security consideration. Once the interface is published, you no longer choose which model calls it, what other tools that model has, or what instructions its user gave. The server has to be correct on its own.',
      ],
    },
    {
      heading: 'Expose a narrow, typed vocabulary',
      paragraphs: [
        'The temptation is a general tool that runs arbitrary script in the page, because it is easy to build and can do anything. It can also do anything, which is the problem — exfiltrate cookies, read other tabs, navigate wherever it likes.',
        'Expose specific actions instead: navigate to an allowed origin, read the page structure, click a referenced element, type into a referenced field, upload a designated file. Each validated, each doing one thing.',
      ],
      bullets: [
        'No arbitrary script execution tool, ever',
        'Navigation restricted to an allow-list of origins',
        'Elements addressed by references your read step issued',
        'Uploads limited to files the user explicitly attached',
      ],
    },
    {
      heading: 'Page content crosses a trust boundary',
      paragraphs: [
        'Your server reads pages written by strangers and hands that text to a model you do not control. A page containing instructions aimed at an agent will reach that model through you.',
        'Return page content in clearly delimited fields marked as untrusted, neutralise the obvious instruction patterns, and — since none of that is a guarantee — make sure the destructive capabilities simply do not exist as tools. A boundary is what the server refuses to do, not what the prompt asks the model not to do.',
      ],
    },
    {
      heading: 'Scope the browser to one user',
      paragraphs: [
        'Browsers hold cookies and logins. A shared browser instance across users is a data breach waiting for the first careless reuse, and it will not look like one in the logs.',
        'Give each session its own isolated context, tie it to a verified identity on the server, and destroy it when the session ends. The client’s claim about who it represents is a claim; the credential you verified is the identity.',
      ],
    },
    {
      heading: 'Limits belong in the server',
      paragraphs: [
        'The client can ask for anything at any rate. Page budgets, navigation caps, time limits and restrictions on irreversible actions all have to be enforced where the tool is implemented.',
        'Treat any submission-like action as requiring an explicit, out-of-band confirmation tied to the user rather than to the agent’s request. That is the one control that keeps an unfamiliar client from doing something irreversible in your user’s name.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why expose browser control through MCP?',
      a: 'It separates the driving model from the browser runtime, so any compatible client can operate it and you can change models without touching the automation layer.',
    },
    {
      q: 'Should the server offer an arbitrary script execution tool?',
      a: 'No. It can do anything, including exfiltrating cookies and navigating anywhere. Expose specific validated actions instead — navigate, read, click, type, upload.',
    },
    {
      q: 'How do I handle page content safely over MCP?',
      a: 'Return it in delimited fields marked untrusted and neutralise obvious instruction patterns — but rely on the destructive capabilities simply not existing as tools, since prompts are not boundaries.',
    },
    {
      q: 'Can multiple users share one browser instance?',
      a: 'No. Browsers hold cookies and logins, so each session needs an isolated context tied to a server-verified identity and destroyed when the session ends.',
    },
  ],
  related: ['how-to-build-a-job-agent-with-mcp', 'how-to-secure-an-ai-browser-agent', 'how-to-safely-give-ai-agents-browser-access'],
};

export default post;

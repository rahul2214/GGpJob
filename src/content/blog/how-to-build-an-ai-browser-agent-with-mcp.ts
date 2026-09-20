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
  anchors: ['browser agent behind MCP', 'browser control tools'],
  excerpt:
    'Publishing browser control as MCP tools means an agent you did not write can drive a browser you are responsible for.',
  keyTakeaways: [
    'Once published, you control neither the model calling you nor what else it has connected.',
    'Never expose arbitrary script execution; offer a narrow typed vocabulary instead.',
    'Page content crosses a trust boundary into a model you do not control.',
    'A browser holds cookies, so one isolated context per verified identity, always.',
    'Limits are enforced where the tool is implemented, never in a prompt.',
  ],
  sections: [
    {
      heading: 'What the protocol changes',
      paragraphs: [
        'Wrapping browser control in MCP separates the driving model from the browser runtime. Any compatible client can then operate it, and you can swap models without touching the automation layer.',
        'That separation is also the whole security consideration. Once the interface is published, you no longer choose which model calls it, what other tools that model has, or what instructions its user gave. The server has to be correct on its own.',
        'The multi-server case makes this concrete. Your browser tools may sit in a session alongside a filesystem server and a mail server, so a page your server reads can reach a model that also holds the ability to write files and send messages — which makes what you return part of someone else’s security model.',
      ],
    },
    {
      heading: 'Expose a narrow, typed vocabulary',
      paragraphs: [
        'The temptation is a general tool that runs arbitrary script in the page, because it is easy to build and can do anything. It can also do anything, which is the problem — exfiltrate cookies, read other tabs, navigate wherever it likes.',
        'Expose specific actions instead: navigate to an allowed origin, read the page structure, click a referenced element, type into a referenced field, upload a designated file. Each validated, each doing one thing.',
        'Element references are what make this enforceable. When the click tool accepts only a reference that your own read step issued, the client cannot point it at something it invented, and the set of things it can touch is exactly the set you showed it.',
      ],
      bullets: [
        'No arbitrary script execution tool, ever',
        'Navigation restricted to an allow-list of origins',
        'Elements addressed by references your read step issued',
        'Uploads limited to files the user explicitly attached',
      ],
      table: {
        caption: 'What to expose, and what to keep',
        columns: ['Capability', 'Expose?', 'Why'],
        rows: [
          ['Navigate to an allowed origin', 'Yes', 'Bounded and checkable'],
          ['Read page structure', 'Yes', 'Returned as untrusted data'],
          ['Click a referenced element', 'Yes', 'Only what you issued'],
          ['Type into a referenced field', 'Yes', 'Value validated server-side'],
          ['Upload a user-attached file', 'Yes', 'Never an arbitrary path'],
          ['Execute arbitrary script', 'No', 'It can do everything'],
          ['Read cookies or storage', 'No', 'No legitimate agent need'],
          ['Submit a form', 'Only with confirmation', 'Irreversible and outward-facing'],
        ],
      },
    },
    {
      heading: 'Page content crosses a trust boundary',
      paragraphs: [
        'Your server reads pages written by strangers and hands that text to a model you do not control. A page containing instructions aimed at an agent will reach that model through you.',
        'Return page content in clearly delimited fields marked as untrusted, neutralise the obvious instruction patterns, and — since none of that is a guarantee — make sure the destructive capabilities simply do not exist as tools. A boundary is what the server refuses to do, not what the prompt asks the model not to do.',
        'Return less, too. A summarised structure of interactive elements is both cheaper and safer than a full page dump, because the text you never send is text that can never carry an instruction anywhere.',
      ],
    },
    {
      heading: 'Scope the browser to one user',
      paragraphs: [
        'Browsers hold cookies and logins. A shared browser instance across users is a data breach waiting for the first careless reuse, and it will not look like one in the logs.',
        'Give each session its own isolated context, tie it to a verified identity on the server, and destroy it when the session ends. The client’s claim about who it represents is a claim; the credential you verified is the identity.',
        'Bind sessions to an expiry as well as to an identity. A browser context left authenticated to a career site indefinitely is a standing capability nobody is watching, and a short lifetime with explicit renewal costs little and removes that.',
      ],
    },
    {
      heading: 'What the server must record',
      paragraphs: [
        'You are operating a browser on someone’s behalf at the request of a client you did not write, which makes the log the only account of what happened. Record every action with its arguments, the origin it touched, the identity it ran as, and the outcome.',
        'Record refusals as well as actions. A client repeatedly asking for a disallowed origin or a withheld capability is the clearest signal available that something is wrong, and it is invisible if only successful calls are logged.',
        'These records contain page content and user data, so give them a retention policy and the same access controls as the primary data. An audit log that is itself unscoped is a second copy of everything you were protecting.',
      ],
      bullets: [
        'Every action, argument, origin, identity and outcome',
        'Refusals, which are the most informative rows you will have',
        'A per-session cap on actions and elapsed time',
        'Retention and access control on the log itself',
      ],
    },
    {
      heading: 'Limits belong in the server',
      paragraphs: [
        'The client can ask for anything at any rate. Page budgets, navigation caps, time limits and restrictions on irreversible actions all have to be enforced where the tool is implemented.',
        'Treat any submission-like action as requiring an explicit, out-of-band confirmation tied to the user rather than to the agent’s request. That is the one control that keeps an unfamiliar client from doing something irreversible in your user’s name.',
        'Make refusals informative rather than opaque. "Navigation refused: origin not in the allow-list" lets a well-behaved client adjust, where a bare error produces retries — and the difference is visible immediately in how much traffic a confused agent generates.',
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
      a: 'Return it in delimited fields marked untrusted, return less of it, and rely on the destructive capabilities simply not existing as tools, since prompts are not boundaries.',
    },
    {
      q: 'Can multiple users share one browser instance?',
      a: 'No. Browsers hold cookies and logins, so each session needs an isolated context tied to a server-verified identity and destroyed when the session ends.',
    },
    {
      q: 'How do element references improve safety?',
      a: 'The click tool accepts only a reference your read step issued, so the client cannot point it at something it invented. It can touch exactly what you showed it.',
    },
    {
      q: 'What should the server log?',
      a: 'Every action with arguments, origin, identity and outcome — and refusals especially, since a client repeatedly asking for disallowed capabilities is the clearest warning you get.',
    },
  ],
  related: ['how-to-build-a-job-agent-with-mcp', 'how-to-secure-an-ai-browser-agent', 'how-to-safely-give-ai-agents-browser-access'],
  references: [
    {
      title: 'Model Context Protocol',
      url: 'https://modelcontextprotocol.io/',
      publisher: 'Model Context Protocol',
      note: 'Tool definitions, transports and the client-server boundary.',
    },
  ],
};

export default post;

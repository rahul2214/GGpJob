import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-job-agent-with-mcp',
  tint: 'indigo',
  title: 'How to Build a Job Agent With MCP',
  heading: 'A job agent over MCP',
  description:
    'Using the Model Context Protocol for a job search agent: what it standardises, how to split servers, where authorisation lives, and the trust boundary it creates.',
  keywords: [
    'mcp job agent',
    'model context protocol',
    'mcp server design',
    'mcp tools jobs',
    'mcp authorization',
    'mcp security',
    'agent integration protocol',
    'build mcp server',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job agent over MCP', 'trust boundary'],
  excerpt:
    'MCP makes your job tools portable across clients. It also means a component you did not write is deciding what your agent can see.',
  keyTakeaways: [
    'The payoff is reach: one tool description any compatible client can consume.',
    'Split servers along trust lines so the blast radius matches what each one can do.',
    'The user identity a client sends is a claim; verify the credential on every call.',
    'You control neither the model calling you nor what else it has connected.',
    'Job descriptions are third-party text flowing into someone else’s model — delimit them.',
  ],
  sections: [
    {
      heading: 'What the protocol actually gives you',
      paragraphs: [
        'Before a standard existed, every agent framework had its own way of describing tools, so integrating with a new client meant rewriting the adapter. MCP replaces that with one description your tools publish and any compatible client can consume.',
        'For a job platform the practical payoff is reach: the same server that powers your own assistant can be connected to a user’s general-purpose agent, without you building a bespoke integration for each.',
        'What it does not give you is quality. A protocol standardises how a tool is described and called, not whether the description is good enough for a model to use it correctly — and in practice most disappointing integrations are a tool-design problem wearing a protocol costume.',
      ],
    },
    {
      heading: 'Split servers along trust lines',
      paragraphs: [
        'Resist putting everything in one server. Public job search, a candidate’s private application history and anything that submits an application have completely different risk profiles, and a single server means a single blast radius.',
        'Separate them and you can reason about each. A read-only public search server can be exposed generously. A server that touches a user’s documents is exposed to that user’s own agent and nothing else. A server that submits applications is the one you guard hardest.',
        'The split also lets you set different rate limits, different audit requirements and different approval behaviour per server, rather than applying the strictest policy to everything because one tool in the set warrants it.',
      ],
      bullets: [
        'Public search — read-only, no user data, broadly connectable',
        'Candidate data — scoped to one verified user, read-mostly',
        'Actions — submission and messaging, narrowest exposure, always confirmed',
      ],
      table: {
        caption: 'Three servers, three postures',
        columns: ['Server', 'Data', 'Exposure', 'Approval'],
        rows: [
          ['Search', 'Public postings', 'Any client', 'None needed'],
          ['Candidate', 'CV, applications, notes', 'That user’s agent only', 'Read freely, writes confirmed'],
          ['Actions', 'Submissions, messages', 'Narrowest possible', 'Every call'],
        ],
      },
    },
    {
      heading: 'Authorisation belongs to the server',
      paragraphs: [
        'The client tells your server who it is acting for. That is a claim, not proof, and a server that trusts it has no access control at all — anyone able to connect can ask for anyone’s data.',
        'Verify the credential on every call and derive the user from what you verified. Scope every query to that identity in the data layer, so a tool call for the wrong user returns nothing rather than relying on the tool remembering to check.',
        'Pushing the check into the data layer is the part that survives contact with a growing codebase. A tool that must remember to filter will eventually be written by someone who forgets; a query that cannot express a cross-user read makes the mistake unavailable.',
      ],
    },
    {
      heading: 'The client is outside your boundary',
      paragraphs: [
        'This is the consequence teams notice late. Once you publish an MCP server, you control neither which model calls it nor what else that model has connected, nor what instructions the user gave it.',
        'Design as if the caller is arbitrary. Every tool validates its own inputs, enforces its own limits and makes its own authorisation decision. Nothing may depend on the agent having behaved sensibly, because you have no way to require that.',
        'The multi-server case is the one worth thinking through. Your server may be connected alongside a filesystem server and an email server in the same session, so a job description your tool returns can reach a model that is also holding the user’s documents — which makes what you return part of someone else’s security model.',
      ],
    },
    {
      heading: 'Designing tools a model can actually use',
      paragraphs: [
        'Tool design decides integration quality more than anything in the protocol. Too many narrow tools and the model picks the wrong one; one tool with fourteen optional parameters and it fills them badly. Somewhere between three and eight well-named tools per server is the range that works.',
        'Descriptions are read by a model, not a developer, so they should say when to use the tool and when not to. "Searches job postings by keyword and location; does not return the user’s own applications — use get_applications for that" prevents a whole class of wrong calls.',
        'Errors should be instructive rather than merely accurate. A message saying which parameter was invalid and what a valid value looks like lets the model recover in one step, where a generic failure produces three increasingly speculative retries.',
      ],
      bullets: [
        'Three to eight tools per server, clearly distinguished',
        'Descriptions that say when not to use the tool',
        'Errors that name the fix, not just the fault',
        'Bounded result sizes, since everything returned costs context',
        'Stable names — renaming a tool breaks every prompt built on it',
      ],
    },
    {
      heading: 'Return content the way you would to a stranger',
      paragraphs: [
        'Your server returns job descriptions written by third parties, and those flow straight into someone else’s model. If a posting contains text aimed at an agent, you have become the delivery mechanism.',
        'Neutralise and delimit the untrusted portions before returning them, and mark clearly which fields are platform data and which are user-supplied content. It costs little and it is the difference between a server that is safe to connect and one that is not.',
        'Size discipline belongs here too. Returning forty full job descriptions floods the caller’s context and degrades the agent that connected to you, so paginate by default and return summaries with a way to fetch the detail for one posting.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What does MCP give a job search agent?',
      a: 'Portability. One tool description any compatible client can consume, so the same server powering your assistant can also be connected to a user general-purpose agent without a bespoke integration.',
    },
    {
      q: 'Should job search and application submission be one MCP server?',
      a: 'No. Public search, private candidate data and submission actions have different risk profiles. Separating them keeps the blast radius proportional to what each one can do.',
    },
    {
      q: 'Can I trust the user identity the MCP client sends?',
      a: 'No — it is a claim. Verify the credential on every call, derive the user from what you verified, and scope queries in the data layer so a wrong-user call returns nothing.',
    },
    {
      q: 'Is returning job descriptions over MCP risky?',
      a: 'It can be. Postings are third-party text flowing into someone else model, so neutralise and delimit untrusted fields and mark which content is user-supplied.',
    },
    {
      q: 'How many tools should a server expose?',
      a: 'Roughly three to eight, clearly distinguished. Too many narrow tools and the model chooses wrongly; one tool with fourteen optional parameters and it fills them badly.',
    },
    {
      q: 'Why does result size matter?',
      a: 'Everything you return occupies the caller context. Forty full job descriptions degrade the agent that connected to you, so paginate and return summaries with a detail fetch.',
    },
  ],
  related: ['mcp-explained-for-developers', 'how-to-build-an-ai-agent-that-uses-tools-to-search-jobs', 'how-to-build-an-ai-browser-agent-with-mcp'],
  references: [
    {
      title: 'Model Context Protocol',
      url: 'https://modelcontextprotocol.io/',
      publisher: 'Model Context Protocol',
      note: 'The specification, including tool definitions and transport.',
    },
  ],
};

export default post;

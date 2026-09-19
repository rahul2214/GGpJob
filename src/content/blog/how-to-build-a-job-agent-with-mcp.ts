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
  excerpt:
    'MCP makes your job tools portable across clients. It also means a component you did not write is deciding what your agent can see.',
  sections: [
    {
      heading: 'What the protocol actually gives you',
      paragraphs: [
        'Before a standard existed, every agent framework had its own way of describing tools, so integrating with a new client meant rewriting the adapter. MCP replaces that with one description your tools publish and any compatible client can consume.',
        'For a job platform the practical payoff is reach: the same server that powers your own assistant can be connected to a user’s general-purpose agent, without you building a bespoke integration for each.',
      ],
    },
    {
      heading: 'Split servers along trust lines',
      paragraphs: [
        'Resist putting everything in one server. Public job search, a candidate’s private application history and anything that submits an application have completely different risk profiles, and a single server means a single blast radius.',
        'Separate them and you can reason about each. A read-only public search server can be exposed generously. A server that touches a user’s documents is exposed to that user’s own agent and nothing else. A server that submits applications is the one you guard hardest.',
      ],
      bullets: [
        'Public search — read-only, no user data, broadly connectable',
        'Candidate data — scoped to one verified user, read-mostly',
        'Actions — submission and messaging, narrowest exposure, always confirmed',
      ],
    },
    {
      heading: 'Authorisation belongs to the server',
      paragraphs: [
        'The client tells your server who it is acting for. That is a claim, not proof, and a server that trusts it has no access control at all — anyone able to connect can ask for anyone’s data.',
        'Verify the credential on every call and derive the user from what you verified. Scope every query to that identity in the data layer, so a tool call for the wrong user returns nothing rather than relying on the tool remembering to check.',
      ],
    },
    {
      heading: 'The client is outside your boundary',
      paragraphs: [
        'This is the consequence teams notice late. Once you publish an MCP server, you control neither which model calls it nor what else that model has connected, nor what instructions the user gave it.',
        'Design as if the caller is arbitrary. Every tool validates its own inputs, enforces its own limits and makes its own authorisation decision. Nothing may depend on the agent having behaved sensibly, because you have no way to require that.',
      ],
    },
    {
      heading: 'Return content the way you would to a stranger',
      paragraphs: [
        'Your server returns job descriptions written by third parties, and those flow straight into someone else’s model. If a posting contains text aimed at an agent, you have become the delivery mechanism.',
        'Neutralise and delimit the untrusted portions before returning them, and mark clearly which fields are platform data and which are user-supplied content. It costs little and it is the difference between a server that is safe to connect and one that is not.',
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
  ],
  related: ['mcp-explained-for-developers', 'how-to-build-an-ai-agent-that-uses-tools-to-search-jobs', 'how-to-build-an-ai-browser-agent-with-mcp'],
};

export default post;

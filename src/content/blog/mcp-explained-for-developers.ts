import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'mcp-explained-for-developers',
  tint: 'sky',
  title: 'MCP Explained for Developers: The Model Context Protocol',
  heading: 'MCP explained for developers',
  description:
    'What the Model Context Protocol is, the problem it solves, how servers and clients fit together, and when building an MCP server is worth it.',
  keywords: [
    'mcp explained',
    'model context protocol',
    'what is mcp',
    'mcp server tutorial',
    'mcp for developers',
    'mcp vs function calling',
    'build an mcp server',
    'model context protocol guide',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Every AI tool integration used to be bespoke. MCP is an attempt to make them interchangeable — one protocol, many clients. Here is how it works and when to bother.',
  sections: [
    {
      heading: 'The problem it exists to solve',
      paragraphs: [
        'Before any standard existed, connecting an AI assistant to your systems meant writing an integration per assistant. Your ticketing system needed one adapter for one product, a different one for the next, and each was thrown away when you switched.',
        'The Model Context Protocol inverts that. You describe your system once, as a server speaking a documented protocol, and any client that speaks it can use your tools. It is the same bargain as any protocol: accept some ceremony now in exchange for not rewriting the integration later.',
      ],
    },
    {
      heading: 'The three things a server can offer',
      paragraphs: [
        'An MCP server exposes capabilities in a small number of shapes. Getting these right is most of the design work, because the client decides what to call based only on the descriptions you provide.',
        'The distinction that trips people up is between tools and resources. A tool does something and may have side effects. A resource is something to read. Modelling a read as a tool works, but it gives the client less to reason about.',
      ],
      bullets: [
        'Tools — actions the model can invoke, with typed inputs and a described effect',
        'Resources — readable content the client can pull in as context',
        'Prompts — reusable templates a user can select deliberately',
      ],
    },
    {
      heading: 'How this differs from plain function calling',
      paragraphs: [
        'Function calling is a model capability: the model emits a structured request and your code runs it. MCP is a transport and discovery layer sitting above that. The model still ultimately calls functions; MCP standardises how those functions are advertised, described and reached across process boundaries.',
        'The practical difference is who owns the integration. With function calling, the application owns every tool definition in its own codebase. With MCP, the tool lives in a separate server that any compliant application can discover at runtime, including ones you did not write.',
        'If your tools are only ever used by your own single application, function calling is simpler and you should use it. MCP earns its overhead when the same capability needs to be reachable from several clients, or when someone else will consume it.',
      ],
    },
    {
      heading: 'Designing tools a model can actually use',
      paragraphs: [
        'The most common failure in a first MCP server is exposing your internal API surface directly. Thirty granular endpoints that made sense for a REST client become thirty confusable options for a model that picks by reading a one-line description.',
        'Design for the caller you actually have. Fewer, task-shaped tools outperform many primitive ones. A tool named search_orders_by_customer with a clear description beats three tools that must be chained in an order the model has to guess.',
      ],
      bullets: [
        'Name tools after the task, not the endpoint',
        'Write descriptions for a reader with no other documentation',
        'Return errors as readable text explaining what to do differently',
        'Keep responses small — raw payload dumps crowd out the question',
        'Make destructive actions explicit and hard to invoke by accident',
      ],
    },
    {
      heading: 'Security is the part people skip',
      paragraphs: [
        'An MCP server is an execution surface reachable by a system that takes instructions from text. If a model can be talked into calling your delete tool, the boundary that matters is the one in your server, not the one in the prompt.',
        'Treat tool inputs as untrusted, because content retrieved from elsewhere can influence what gets called. Scope credentials to the narrowest workable permission, log invocations with enough detail to reconstruct a sequence, and require confirmation for anything irreversible.',
      ],
    },
    {
      heading: 'Is it worth learning right now?',
      paragraphs: [
        'For developers working on internal AI tooling, yes — the concepts transfer even if a different standard eventually wins. Thinking about tool granularity, description quality and permission scoping is durable regardless of the wire format.',
        'For everyone else it is worth one weekend. Build a server over something you already run, connect it to a client, and notice what the model gets wrong. That exercise teaches more about why AI integrations fail than a month of reading will.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the Model Context Protocol in simple terms?',
      a: 'It is a standard way for an application to describe its tools and data so that any compatible AI client can use them. Instead of writing a new integration for each assistant, you write one server that several clients can connect to.',
    },
    {
      q: 'Is MCP the same as function calling?',
      a: 'No. Function calling is the model emitting a structured request that your code executes. MCP is the layer above it that standardises how tools are advertised and reached across processes, so tools can live outside the application consuming them.',
    },
    {
      q: 'When should I not use MCP?',
      a: 'When your tools are used only by one application you control. The protocol adds a process boundary and discovery machinery whose value comes from reuse across clients. With a single consumer, direct function calling is simpler and faster.',
    },
    {
      q: 'What are the main security risks of an MCP server?',
      a: 'The server is reachable by a system that acts on untrusted text, so retrieved content can influence which tools get called. Scope credentials tightly, treat all tool inputs as untrusted, log invocations, and gate anything irreversible behind explicit confirmation.',
    },
  ],
  related: ['what-is-context-engineering', 'what-are-ai-agents', 'ai-inference-engineer'],
};

export default post;

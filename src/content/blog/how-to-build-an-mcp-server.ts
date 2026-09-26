import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-mcp-server',
  tint: 'violet',
  title: 'How to Build an MCP Server: Complete Developer Tutorial with TypeScript',
  heading: 'How to build an MCP server: step-by-step developer tutorial with TypeScript',
  description:
    'Step-by-step guide to building a production Model Context Protocol (MCP) server with TypeScript. Implement tools, resources, Zod schemas, and connect to Claude or AI agents.',
  keywords: [
    'how to build an mcp server',
    'build an mcp server tutorial',
    'model context protocol tutorial',
    'mcp typescript sdk',
    'mcp tools and resources',
    'how to connect mcp to claude desktop',
    'mcp server vs rest api',
    'building custom ai tools with mcp',
    'model context protocol step by step',
    'mcp stdio transport setup',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 11,
  category: 'AI Engineering',
  anchors: ['build an MCP server tutorial', 'MCP TypeScript SDK'],
  excerpt:
    'The Model Context Protocol standardizes how AI applications connect to external tools and data sources. Here is how to build and test your own MCP server from scratch.',
  keyTakeaways: [
    'The Model Context Protocol (MCP) exposes three primary capabilities to AI clients: Tools (executable functions with side effects), Resources (contextual read-only data), and Prompts (reusable templates).',
    'Building an MCP server requires defining strict input schemas using libraries like Zod and choosing a transport layer (stdio for local desktop apps, SSE/HTTP for remote servers).',
    'The official MCP TypeScript SDK simplifies server creation, protocol handshake negotiation, and error handling.',
    'MCP servers decouple data access from specific AI models, allowing the exact same tool to be shared across Claude Desktop, Cursor, and custom autonomous agents.',
    'Production security requires validating all parameters, executing sandboxed read-only database queries, and auditing client invocations.',
  ],
  sections: [
    {
      heading: 'Why MCP is replacing bespoke tool integrations',
      paragraphs: [
        'Before the release of the Model Context Protocol (MCP), integrating external data into an AI assistant was fragmented. Every developer wrote custom function-calling definitions, glued together bespoke REST wrappers, and rewrote the entire integration whenever switching between Claude, OpenAI, or local open-source models.',
        'MCP acts like the Language Server Protocol (LSP) for artificial intelligence. By creating an MCP server once, any compatible client—whether Claude Desktop, an IDE coding assistant, or an enterprise agentic workflow—can instantly discover your tools, inspect input schemas, and invoke backend functions.',
        'In this build an MCP server tutorial, we walk through building a complete, production-grade MCP server using TypeScript and Node.js that connects an AI agent directly to a live PostgreSQL recruitment database.',
      ],
      bullets: [
        'One standardized protocol connects diverse AI clients to private tools and data.',
        'Eliminates rewriting custom API wrappers for every LLM vendor.',
        'Enforces typed parameters and structured JSON inputs via client-side discovery.',
      ],
    },
    {
      heading: 'MCP architecture: Tools, Resources, and Transports',
      paragraphs: [
        'An MCP server communicates with client applications through three distinct primitives and two standardized communication transports.',
      ],
      table: {
        caption: 'The Core Primitives of Model Context Protocol',
        columns: ['Primitive', 'Type', 'Description', 'Real-World Example'],
        rows: [
          ['Tools', 'Executable Action', 'Functions the LLM can invoke with arguments to alter state or fetch dynamic data', 'schedule_interview, create_job_post'],
          ['Resources', 'Read-Only Data', 'Structured documents, files, or URI endpoints the client reads into context', 'postgres://jobs/active, file://resumes/alice.pdf'],
          ['Prompts', 'Interaction Templates', 'Pre-engineered workflow prompts presented directly to human users', 'review_candidate_code, screen_resume_rubric'],
          ['stdio Transport', 'Process I/O', 'Local inter-process communication using standard input and output streams', 'Claude Desktop app connecting to local Node/Python script'],
          ['SSE Transport', 'Network HTTP', 'Server-Sent Events over HTTP for cloud-hosted remote multi-tenant servers', 'Enterprise SaaS backend serving remote agent swarms'],
        ],
      },
    },
    {
      heading: 'Step-by-step implementation with the TypeScript SDK',
      paragraphs: [
        'To get started, initialize a new Node.js project and install the official MCP TypeScript SDK alongside Zod for schema validation.',
        'Using the Server class from @modelcontextprotocol/sdk/server, register handlers for ListToolsRequestSchema and CallToolRequestSchema. Input arguments are validated at runtime via Zod schemas, returning structured candidate records directly to the requesting model.',
        'Finally, attach the server to StdioServerTransport, enabling local AI clients like Claude Desktop or Cursor to communicate over standard input and output streams.',
      ],
      example: {
        title: 'Defining an MCP Candidate Search Tool',
        paragraphs: [
          'The server advertises search_job_candidates with required parameters for technical skill (string) and minimum years of experience (number).',
          'When invoked, the tool executes an internal query against PostgreSQL and returns stringified JSON records within the MCP content block format.',
        ],
      },
    },
    {
      heading: 'Testing and connecting to Claude Desktop',
      paragraphs: [
        'To connect your newly built server to Claude Desktop, open the local configuration file located at claude_desktop_config.json in your application data directory.',
        'Add your server configuration under the mcpServers key, specifying node as the executable command and passing the absolute path to your compiled server.js script along with any required environment variables.',
        'When Claude Desktop boots, it executes the protocol handshake, displays your tool under the chat input, and automatically triggers it when users ask relevant recruitment questions.',
      ],
      bullets: [
        'Place configuration in %APPDATA%/Claude/claude_desktop_config.json on Windows.',
        'Pass environment variables like DATABASE_URL directly in the configuration object.',
        'Restart Claude Desktop to verify the tool handshake in the conversation window.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between an MCP tool and an MCP resource?',
      a: 'Tools are active functions invoked by the model that can perform calculations, query databases, or trigger side effects. Resources are passive data streams (like file contents or system logs) that the client reads into context without execution.',
    },
    {
      q: 'Can MCP servers run on remote cloud servers instead of local machines?',
      a: 'Yes. While stdio transport is used for local tools, MCP supports Server-Sent Events (SSE) over standard HTTP, allowing teams to deploy centralized cloud MCP servers accessible by remote agent swarms.',
    },
    {
      q: 'Is MCP exclusive to Anthropic Claude?',
      a: 'No. MCP is an open-source standard released under the MIT license. Many leading agent frameworks (including LangChain, LlamaIndex, Cursor, and Continue.dev) natively support MCP clients and servers.',
    },
  ],
  related: [
    'mcp-vs-rag',
    'how-to-build-an-agentic-rag-system',
    'how-to-build-an-ai-database-assistant',
  ],
  references: [
    {
      title: 'Model Context Protocol TypeScript SDK',
      url: 'https://github.com/modelcontextprotocol/typescript-sdk',
      publisher: 'GitHub',
      note: 'Official open-source TypeScript SDK for building Model Context Protocol servers and clients.',
    },
    {
      title: 'Anthropic Cookbook: MCP Implementation Patterns',
      url: 'https://github.com/anthropics/anthropic-cookbook',
      publisher: 'GitHub',
      note: 'Comprehensive recipe repository demonstrating end-to-end tool integration and agentic loops.',
    },
  ],
};

export default post;

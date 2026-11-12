import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  "slug": "model-context-protocol-mcp-explained",
  "title": "Model Context Protocol (MCP) Explained for Software Engineers (2026)",
  "heading": "Model Context Protocol (MCP) Explained for Software Engineers",
  "description": "Understand the open Model Context Protocol (MCP) standard. Learn how MCP connects AI models to databases, tools, APIs, and local developer environments safely.",
  "keywords": [
    "model context protocol explained",
    "mcp tutorial software engineer",
    "anthropic model context protocol architecture",
    "mcp vs custom rest apis llm",
    "build mcp server typescript python"
  ],
  "publishedAt": "2026-03-12T08:00:00.000Z",
  "updatedAt": "2026-03-12T08:00:00.000Z",
  "author": "Aditya Verma",
  "readingMinutes": 13,
  "category": "Career Growth",
  "tint": "sky",
  "excerpt": "The Model Context Protocol (MCP) is doing for AI tool integrations what the Language Server Protocol (LSP) did for code editors. Here is the architectural deep-dive every developer needs.",
  "keyTakeaways": [
    "Model Context Protocol (MCP) is an open standard that allows LLMs to interact with external data sources, developer tools, and business systems uniformly.",
    "Instead of writing custom point-to-point API adapters for every model provider, developers build one MCP Server that works across all MCP Clients.",
    "MCP defines three core primitives: Resources (readable data), Tools (executable functions with side effects), and Prompts (reusable templates).",
    "Communication happens over JSON-RPC 2.0 via standard input/output (stdio) or Server-Sent Events (SSE).",
    "Enterprise tech companies are actively replacing proprietary plugin architectures with open MCP servers."
  ],
  "anchors": [
    "Why MCP? The N-by-M Integration Crisis",
    "The Client-Host-Server Architecture",
    "Resources, Tools, and Prompts",
    "Building an MCP Server in TypeScript",
    "Security Boundaries & Enterprise Adoption"
  ],
  "sections": [
    {
      "heading": "Why MCP? The N-by-M Integration Crisis",
      "paragraphs": [
        "Before the advent of the Language Server Protocol (LSP) created by Microsoft, if there were N programming languages (Python, Rust, Go) and M code editors (VS Code, Sublime, Vim), developers had to build N × M custom plugins to support auto-complete and syntax highlighting.",
        "AI tooling faced the exact same crisis: connecting OpenAI, Anthropic, Google Gemini, and open-source models to GitHub, PostgreSQL, Slack, Linear, and Jira required dozens of brittle, proprietary connectors.",
        "The Model Context Protocol (MCP), open-sourced by Anthropic and adopted across the industry, solves this by standardizing the protocol. Write one MCP server for your Postgres database or Jira board, and every AI client can immediately inspect, query, and mutate data safely."
      ]
    },
    {
      "heading": "The Client-Host-Server Architecture",
      "paragraphs": [
        "The MCP ecosystem is cleanly divided into three distinct roles."
      ],
      "bullets": [
        "MCP Host: The application coordinating the user interaction and AI model (e.g., Antigravity IDE, Claude Desktop, Cursor, or your custom agent runner).",
        "MCP Client: A protocol client embedded inside the Host that initiates connections, discovers available capabilities, and enforces user security permissions.",
        "MCP Server: A lightweight, standalone process exposing local or remote data via standardized MCP primitives (e.g., a SQLite server, a GitHub PR inspector, or a file system explorer)."
      ]
    },
    {
      "heading": "The Three Core Primitives: Resources, Tools, and Prompts",
      "paragraphs": [
        "MCP exposes capabilities through three standardized abstractions."
      ],
      "table": {
        "rows": [
          [
            "Resources",
            "Read-only data payloads (file contents, database rows, API responses)",
            "No (Idempotent GET)",
            "REST GET endpoint or file descriptor"
          ],
          [
            "Tools",
            "Executable functions called by the model with structured parameters",
            "Yes (Can write, mutate, execute code)",
            "REST POST/PUT endpoint or shell command"
          ],
          [
            "Prompts",
            "Pre-configured workflow templates and interactive prompt guides",
            "No",
            "Saved prompt recipes or slash commands"
          ]
        ],
        "columns": [
          "Primitive",
          "Semantics",
          "Side Effects?",
          "Analogy"
        ],
        "caption": "The Three Core Primitives: Resources, Tools, and Prompts Overview & Comparison"
      }
    },
    {
      "heading": "Building an MCP Server in TypeScript: Practical Example",
      "paragraphs": [
        "Creating a custom MCP server is straightforward using the official `@modelcontextprotocol/sdk`. Below is a functioning server exposing a database lookup tool."
      ],
      "example": {
        "title": "Minimal MCP Server Exposing Job Query Tools in TypeScript",
        "paragraphs": [
          "import { Server } from '@modelcontextprotocol/sdk/server/index.js';\nimport { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';\nimport { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';",
          "const server = new Server({ name: 'jobsdart-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });",
          "// 1. Expose tool metadata to the AI client\nserver.setRequestHandler(ListToolsRequestSchema, async () => ({\n  tools: [\n    {\n      name: 'search_verified_jobs',\n      description: 'Search direct MNC career openings on JobsDart by skill and location',\n      inputSchema: {\n        type: 'object',\n        properties: {\n          skill: { type: 'string', description: 'Primary tech skill (e.g. Next.js, Kubernetes)' },\n          location: { type: 'string', description: 'City or remote (e.g. Bengaluru, Remote)' },\n        },\n        required: ['skill'],\n      },\n    },\n  ],\n}));",
          "// 2. Handle tool invocation from the model\nserver.setRequestHandler(CallToolRequestSchema, async (request) => {\n  if (request.params.name === 'search_verified_jobs') {\n    const { skill, location } = request.params.arguments as any;\n    const results = await fetchJobsFromDb(skill, location);\n    return { content: [{ type: 'text', text: JSON.stringify(results) }] };\n  }\n  throw new Error('Unknown tool');\n});",
          "const transport = new StdioServerTransport();\nawait server.connect(transport);"
        ]
      }
    },
    {
      "heading": "Security Boundaries & Enterprise Adoption",
      "paragraphs": [
        "Because MCP tools can execute shell commands or write to production databases, security isolation is critical. Enterprise MCP implementations enforce strict human-in-the-loop approvals before allowing any tool with state mutation capabilities to execute."
      ]
    }
  ],
  "faqs": [
    {
      "q": "Is MCP proprietary to Anthropic?",
      "a": "No. While originated by Anthropic, MCP is an open-source standard under the MIT license with active participation from major IDE creators, foundation model developers, and cloud providers."
    },
    {
      "q": "How does MCP transport messages?",
      "a": "MCP supports two transports: stdio (standard input/output for local processes running on your machine) and SSE (Server-Sent Events over HTTP for remote services and cloud microservices)."
    },
    {
      "q": "Does learning MCP help my engineering career?",
      "a": "Yes! As organizations adopt AI coding agents and autonomous workflows, developers who can expose internal corporate databases and APIs via standardized MCP servers are in high demand."
    }
  ],
  "related": [
    "agentic-ai-developer-roadmap-2026",
    "what-is-context-engineering-in-ai",
    "full-stack-developer-vs-ai-engineer",
    "python-developer-roadmap-2026"
  ],
  "authorProfile": {
    "name": "Aditya Verma",
    "role": "Staff Engineer & Open Source Contributor",
    "bio": "Aditya Verma is a Staff Engineer & Open Source Contributor specializing in engineering recruitment and tech careers.",
    "avatarUrl": "/images/authors/aditya-verma.jpg"
  }
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-claude',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With Claude',
  heading: 'Building on Claude models',
  description:
    'Using Claude for a job agent: tool use, prompt caching for repeated context, MCP for tool portability, and where careful instruction-following pays off.',
  keywords: [
    'claude job agent',
    'claude tool use',
    'prompt caching',
    'mcp claude tools',
    'instruction following llm',
    'claude api agent',
    'agent cost caching',
    'anthropic api agent',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'The features that change the economics of a job agent are prompt caching and a tool protocol you do not have to reinvent.',
  sections: [
    {
      heading: 'Tool use is the loop',
      paragraphs: [
        'Describe the tools, let the model select one, execute it, return the result, repeat. As everywhere, the quality of the agent tracks the quality of the tool definitions far more closely than it tracks the model.',
        'Give each tool a name that states its effect and a description that says when to use it and when not to. Explicit negative guidance — "do not use this to submit an application" — meaningfully reduces inappropriate calls, though it remains guidance rather than a control.',
      ],
    },
    {
      heading: 'Prompt caching changes the cost model',
      paragraphs: [
        'A job agent sends the same material repeatedly: the system prompt, the tool definitions, the candidate’s profile. Across a run scoring fifty postings, that is the same large prefix fifty times.',
        'Caching that prefix cuts both cost and latency substantially. The design implication is structural: put the stable content first and the variable content last, so the cacheable portion is as long as possible.',
      ],
      bullets: [
        'System prompt and tool definitions first — never varying',
        'Candidate profile next — stable for the whole run',
        'The specific posting last — the only part that changes',
        'Avoid injecting timestamps or ids into the stable prefix',
      ],
    },
    {
      heading: 'MCP for portable tools',
      paragraphs: [
        'Rather than wiring tools into one application, expose them through the Model Context Protocol and they become reusable across clients — your own assistant, a user’s general-purpose agent, an internal tool.',
        'The trade is a real trust boundary: once published, you do not control which model calls the server or what else it has connected. Every tool must authorise and validate independently, because you can no longer rely on the caller behaving.',
      ],
    },
    {
      heading: 'Careful instruction-following is worth exploiting',
      paragraphs: [
        'Where these models are reliably useful is in following detailed constraints about what not to do: do not claim experience absent from the record, do not fill demographic questions, do not submit without confirmation.',
        'Exploit that for quality, and do not mistake it for security. A model that follows instructions well still cannot be the thing that stops a hostile job posting from causing an unwanted action. The tool layer is the control; the instruction is the intent.',
      ],
    },
    {
      heading: 'Structure the untrusted content',
      paragraphs: [
        'Job postings and web pages enter the context as third-party text. Wrap them in explicit delimiters, label them as data, and state that instructions inside them are content to be reported rather than followed.',
        'That reduces the success rate of injected instructions and does not eliminate it. Pair it with the only reliable defence: not giving the reading component any tool that could take a consequential action.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What most affects agent quality with Claude?',
      a: 'Tool definitions. Names stating the effect, descriptions saying when to use and when not to — that tracks quality far more closely than the model choice does.',
    },
    {
      q: 'How does prompt caching help a job agent?',
      a: 'A run scoring fifty postings resends the same system prompt, tools and profile fifty times. Caching that prefix cuts cost and latency — so put stable content first, variable content last.',
    },
    {
      q: 'Why expose tools over MCP?',
      a: 'They become reusable across clients. The trade is a real trust boundary: every tool must authorise and validate independently, since you no longer control the caller.',
    },
    {
      q: 'Can strong instruction-following replace security controls?',
      a: 'No. It improves quality, but a hostile posting is stopped by the reading component having no consequential tool — not by an instruction telling it to behave.',
    },
  ],
  related: ['how-to-build-a-job-agent-with-mcp', 'how-to-build-an-ai-job-agent-with-openai', 'ai-job-agents-and-prompt-injection'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-uses-tools-to-search-jobs',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Uses Tools to Search Jobs',
  heading: 'Tool design for a job search agent',
  description:
    'How to design tools an agent can actually use well: granularity, naming, return shapes, error messages that teach, and the limits you enforce in code.',
  keywords: [
    'ai agent tools',
    'tool calling design',
    'function calling jobs',
    'agent tool granularity',
    'tool error handling',
    'job search agent',
    'llm tool use',
    'agent api design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'An agent is mostly its tools. Most agent failures that look like reasoning problems are tool design problems wearing a disguise.',
  sections: [
    {
      heading: 'Design tools for the model, not for your API',
      paragraphs: [
        'The instinct is to expose the endpoints you already have. Those were designed for a developer who reads documentation, holds state across calls and knows which of eleven optional parameters matter. A model has none of that.',
        'Design a separate, smaller surface. Fewer tools, each doing one comprehensible thing, with parameters that are obvious from their names. `searchJobs(query, location, seniority)` is usable; a generic `query(filters)` taking an arbitrary object is an invitation to malformed calls.',
      ],
    },
    {
      heading: 'Granularity is the main lever',
      paragraphs: [
        'Too fine and the agent needs six calls to do one thing, burning context and multiplying the chances of going off track. Too coarse and it cannot express what it wants, so it approximates and you get subtly wrong results.',
        'The useful heuristic: a tool should correspond to something a person would describe as a single step. "Search for jobs" is a step. "Open a database connection" is not. "Do the whole job search" is not either — that is the agent’s job, not a tool.',
      ],
      bullets: [
        'One tool per step a user would name out loud',
        'Required parameters few; optional parameters fewer still',
        'Names that describe the effect, not the implementation',
        'No tool whose correct use depends on having called another first',
      ],
    },
    {
      heading: 'Return shapes decide how well it reasons',
      paragraphs: [
        'Returning fifty full job descriptions floods the context and the agent loses the thread. Returning bare identifiers gives it nothing to reason with, so it fetches each one and you are back to flooding.',
        'Return a compact, decision-shaped result: title, company, location, a short summary, the identifier. Enough to choose, small enough to hold twenty of. Then provide a separate tool to fetch the full description of the one it chose.',
      ],
    },
    {
      heading: 'Errors should teach the next attempt',
      paragraphs: [
        'A tool that returns "Bad Request" gives the agent nothing, so it retries the same call, gets the same error, and either loops or gives up. Both look like a broken model and are a broken message.',
        'Say what was wrong and what would be right: "seniority must be one of junior, mid, senior — received lead". Agents recover from that on the next call almost every time. This is the cheapest reliability improvement available in agent work.',
      ],
    },
    {
      heading: 'Enforce limits in the tool, not the prompt',
      paragraphs: [
        'Telling the agent not to search more than twenty times is a suggestion. Counting calls in the tool layer and refusing the twenty-first is a limit.',
        'Everything that actually matters — how many searches, which employers are in scope, whether a submission is allowed — belongs in code around the tool. The prompt describes intended behaviour; only the tool layer constrains it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can I just expose my existing API to the agent?',
      a: 'Usually not well. Your API assumes a developer who reads docs and holds state. Build a smaller surface with fewer tools, each doing one comprehensible thing with obvious parameters.',
    },
    {
      q: 'How granular should agent tools be?',
      a: 'A tool should match something a person would name as a single step. "Search for jobs" qualifies; "open a database connection" is too fine and "do the whole job search" is the agent role, not a tool.',
    },
    {
      q: 'What should a search tool return to an agent?',
      a: 'A compact decision-shaped result — title, company, location, short summary, identifier — enough to choose between twenty. Full descriptions belong in a separate fetch tool for the chosen one.',
    },
    {
      q: 'Where should agent limits be enforced?',
      a: 'In the tool layer, in code. A prompt saying "search at most twenty times" is a suggestion; a counter that refuses the twenty-first call is a limit.',
    },
  ],
  related: ['how-to-build-a-job-agent-with-mcp', 'how-to-build-reliable-ai-agents', 'what-are-ai-agents'],
};

export default post;

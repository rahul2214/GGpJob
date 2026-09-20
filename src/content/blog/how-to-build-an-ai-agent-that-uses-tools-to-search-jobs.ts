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
  anchors: ['tool design', 'uses tools to search'],
  excerpt:
    'An agent is mostly its tools. Most agent failures that look like reasoning problems are tool design problems wearing a disguise.',
  keyTakeaways: [
    'Your existing API was designed for a developer who reads documentation; build a smaller surface.',
    'A tool should match a step a person would name out loud.',
    'Return decision-shaped results, with a separate fetch for the one that was chosen.',
    'An error that names the fix recovers on the next call; "Bad Request" produces a loop.',
    'Prompts describe intent; only the tool layer constrains behaviour.',
  ],
  sections: [
    {
      heading: 'Design tools for the model, not for your API',
      paragraphs: [
        'The instinct is to expose the endpoints you already have. Those were designed for a developer who reads documentation, holds state across calls and knows which of eleven optional parameters matter. A model has none of that.',
        'Design a separate, smaller surface. Fewer tools, each doing one comprehensible thing, with parameters that are obvious from their names. `searchJobs(query, location, seniority)` is usable; a generic `query(filters)` taking an arbitrary object is an invitation to malformed calls.',
        'Write the description for the model too, since that is the only documentation it gets. Saying when not to use a tool — "does not return the user’s own applications; use getApplications for that" — prevents a whole category of wrong calls that no amount of prompt engineering elsewhere will fix.',
      ],
    },
    {
      heading: 'Granularity is the main lever',
      paragraphs: [
        'Too fine and the agent needs six calls to do one thing, burning context and multiplying the chances of going off track. Too coarse and it cannot express what it wants, so it approximates and you get subtly wrong results.',
        'The useful heuristic: a tool should correspond to something a person would describe as a single step. "Search for jobs" is a step. "Open a database connection" is not. "Do the whole job search" is not either — that is the agent’s job, not a tool.',
        'Watch the count as well as the size. Beyond roughly eight or ten tools, selection accuracy falls noticeably, and the fix is usually consolidation rather than better descriptions — three tools that differ only in a filter should have been one tool with a parameter.',
      ],
      bullets: [
        'One tool per step a user would name out loud',
        'Required parameters few; optional parameters fewer still',
        'Names that describe the effect, not the implementation',
        'No tool whose correct use depends on having called another first',
      ],
      table: {
        caption: 'Tool design, wrong and right',
        columns: ['Problem', 'Symptom', 'Fix'],
        rows: [
          ['Generic query tool', 'Malformed filter objects', 'Named parameters'],
          ['Fourteen tools', 'Picks the wrong one', 'Consolidate to under ten'],
          ['Tool returning everything', 'Loses the thread', 'Summaries plus a fetch tool'],
          ['Opaque errors', 'Retry loops', 'Say what a valid value is'],
          ['Ordering dependency', 'Calls out of sequence', 'Make each call self-contained'],
          ['Limit stated in the prompt', 'Ignored under pressure', 'Count in the tool layer'],
        ],
      },
    },
    {
      heading: 'Return shapes decide how well it reasons',
      paragraphs: [
        'Returning fifty full job descriptions floods the context and the agent loses the thread. Returning bare identifiers gives it nothing to reason with, so it fetches each one and you are back to flooding.',
        'Return a compact, decision-shaped result: title, company, location, a short summary, the identifier. Enough to choose, small enough to hold twenty of. Then provide a separate tool to fetch the full description of the one it chose.',
        'Paginate rather than truncate, and say which you did. An agent told there are more results can decide whether to ask for them; an agent handed a silently truncated list concludes that eight roles exist and reasons confidently from a false premise.',
      ],
    },
    {
      heading: 'Errors should teach the next attempt',
      paragraphs: [
        'A tool that returns "Bad Request" gives the agent nothing, so it retries the same call, gets the same error, and either loops or gives up. Both look like a broken model and are a broken message.',
        'Say what was wrong and what would be right: "seniority must be one of junior, mid, senior — received lead". Agents recover from that on the next call almost every time. This is the cheapest reliability improvement available in agent work.',
        'Distinguish the kinds of failure, because the right recovery differs. A validation error should be fixed and retried; a rate limit should be waited on; an empty result is a successful call that needs a different query; and an upstream outage is a reason to stop rather than to try eleven variations.',
      ],
    },
    {
      heading: 'Tool results are untrusted input',
      paragraphs: [
        'A job search tool returns text written by strangers, and that text goes straight into the model’s context. A posting containing instructions addressed to an agent is a realistic thing to encounter, not a theoretical concern.',
        'Delimit the untrusted portion clearly and label which fields are platform data and which are third-party content. It costs nothing and it is the difference between a tool that is safe to hand to an agent and one that is a delivery mechanism.',
        'The real control, though, is what else the agent can do. A search tool alongside a send-email tool means an injected instruction has something to reach for; a read-only tool set means the worst outcome is a strange summary, and that is a property of the architecture rather than of the prompt.',
      ],
      bullets: [
        'Delimit third-party text and say what it is',
        'Strip anything that looks like an instruction block',
        'Keep read tools and act tools in separate scopes',
        'Assume a prompt rule will be bypassed; design as if it has been',
      ],
    },
    {
      heading: 'Enforce limits in the tool, not the prompt',
      paragraphs: [
        'Telling the agent not to search more than twenty times is a suggestion. Counting calls in the tool layer and refusing the twenty-first is a limit.',
        'Everything that actually matters — how many searches, which employers are in scope, whether a submission is allowed — belongs in code around the tool. The prompt describes intended behaviour; only the tool layer constrains it.',
        'Make a refusal informative rather than a bare failure. "Search budget exhausted for this run — 20 of 20 used" tells the agent to conclude with what it has, where an unexplained error invites it to retry until something else stops it.',
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
    {
      q: 'How many tools is too many?',
      a: 'Selection accuracy falls noticeably beyond roughly eight to ten. The fix is consolidation — three tools differing only by a filter should be one tool with a parameter.',
    },
    {
      q: 'Are tool results a security concern?',
      a: 'Yes. Postings are third-party text entering the model context. Delimit it, and keep read tools separate from acting tools so an injected instruction has nothing to reach for.',
    },
  ],
  related: ['how-to-build-a-job-agent-with-mcp', 'how-to-build-reliable-ai-agents', 'what-are-ai-agents'],
};

export default post;

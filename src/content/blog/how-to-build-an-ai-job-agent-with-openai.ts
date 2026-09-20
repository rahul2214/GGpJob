import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-openai',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With OpenAI',
  heading: 'Building on OpenAI models',
  description:
    'Practical use of OpenAI models in a job agent: function calling, structured outputs, choosing model size per task, cost control and provider portability.',
  keywords: [
    'openai job agent',
    'function calling openai',
    'structured outputs json schema',
    'model selection cost',
    'openai api agent',
    'prompt caching',
    'provider portability',
    'llm cost control',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job agent with OpenAI', 'schema-constrained output'],
  excerpt:
    'The features that matter for an agent are the boring ones: reliable tool calling and guaranteed output shapes.',
  keyTakeaways: [
    'A job agent needs data, not prose — schema-constrained output removes a real class of incidents.',
    'Most "the model called my tool wrong" problems are description problems.',
    'Route per task; using the strongest model everywhere is the usual way to overspend.',
    'Cost comes from volume, so cap calls per run and set alerts before launch.',
    'One adapter keeps a price change from becoming a migration project.',
  ],
  sections: [
    {
      heading: 'Structured output is the feature to build on',
      paragraphs: [
        'A job agent needs data, not prose: extracted requirements, scored matches, parsed profile fields. Asking for JSON in a prompt and parsing what comes back fails often enough to be a real source of incidents.',
        'Schema-constrained output removes that failure mode. Define the shape, receive it reliably, and drop the defensive parsing, repair prompts and retry loops that otherwise accumulate around every extraction step.',
        'Validate the domain separately from the shape. A schema-valid extraction with a zero salary, a date in the future or a seniority outside your allowed set has satisfied the constraint and not the requirement, and that check belongs at the same boundary.',
      ],
    },
    {
      heading: 'Function calling is the tool layer',
      paragraphs: [
        'Describe your tools, let the model choose, execute, return the result, continue. That loop is the agent, and its reliability depends mostly on how well the tools are described rather than on the model.',
        'Name parameters so their meaning is obvious, keep the tool count modest, and make required parameters few. A poorly named parameter produces a confidently wrong call, and it looks like a model failure when it is a documentation failure.',
        'Handle parallel tool calls deliberately. A model may request several at once, which is a useful speedup for reads and a hazard for writes — so decide per tool whether it is safe to run concurrently rather than executing whatever arrives in whatever order.',
      ],
      bullets: [
        'Clear tool names describing the effect',
        'Few required parameters, obvious from their names',
        'Error returns that state what would be valid',
        'A per-tool decision about parallel execution',
        'Limits enforced in your code, never by the description',
      ],
      table: {
        caption: 'Routing tasks to model size',
        columns: ['Task', 'Model', 'Why'],
        rows: [
          ['Classifying a recruiter reply', 'Small', 'Four categories, clear signal'],
          ['Extracting posting requirements', 'Small to mid', 'Structured, well-specified'],
          ['Deciding a transferable-skill match', 'Large', 'Genuine judgement'],
          ['Phrasing an achievement for a role', 'Large', 'Quality is visible to a reader'],
          ['Summarising a company', 'Small', 'Low stakes, easy to check'],
          ['Navigating an unfamiliar form', 'Large', 'Unpredictable, expensive to get wrong'],
        ],
      },
    },
    {
      heading: 'Match the model to the task',
      paragraphs: [
        'Using the largest model for everything is the most common way to overspend. Classifying a reply, extracting fields from a posting and formatting a summary are easy tasks that smaller models handle at a fraction of the cost.',
        'Reserve the strongest model for the genuinely hard judgements: whether transferable experience satisfies a requirement, or how to phrase an achievement for a specific role. Route per task, and measure quality per route rather than assuming.',
        'Build a small labelled set per route before switching anything down. Fifty examples with a known right answer tell you in an afternoon whether the cheaper model is adequate for that step, which is the only honest way to make this decision.',
      ],
    },
    {
      heading: 'Control cost structurally',
      paragraphs: [
        'Cost problems in agents come from volume, not from single calls. An agent scoring two hundred postings per user per day at a few cents each is a number that surprises people at the end of the month.',
        'Cache aggressively on stable inputs, keep long shared prefixes stable so provider-side caching can apply, cap calls per run in code, and set spending alerts. Do this before launch: the alternative is discovering the shape of your costs from an invoice.',
        'Cheap filtering before expensive scoring is the largest structural saving available. Narrowing two hundred postings to the top twenty with deterministic rules and embeddings, then scoring only those carefully, costs a tenth as much and loses very little.',
        'Track cost per user per day as a first-class metric, not only total spend. A single user whose configuration produces forty times the average is invisible in an aggregate and obvious in a per-user view, and it is always a configuration problem rather than a pricing one.',
      ],
    },
    {
      heading: 'Keep the provider swappable',
      paragraphs: [
        'Provider-specific types spread through a codebase quickly, and then a price change, an outage or a better model elsewhere becomes a migration project rather than a configuration change.',
        'Put one adapter between your agent and the API, express tools and outputs in your own types, and keep everything provider-shaped behind that seam. It costs a small amount now and preserves an option worth having.',
        'Record the provider and model version with every stored result. Without it, a change in scoring behaviour after a model update is indistinguishable from a change in the market, and re-scoring for consistency becomes guesswork instead of a query.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Which OpenAI feature matters most for an agent?',
      a: 'Schema-constrained structured output. A job agent needs data, not prose, and asking for JSON in a prompt fails often enough to cause real incidents.',
    },
    {
      q: 'Why does the model call my tools incorrectly?',
      a: 'Usually a description problem, not a model one. Unclear parameter names and too many required parameters produce confidently wrong calls.',
    },
    {
      q: 'Should I use the largest model throughout?',
      a: 'No — that is the most common way to overspend. Classification, extraction and formatting run well on smaller models; reserve the strongest for genuine judgement.',
    },
    {
      q: 'How do I avoid a surprise bill?',
      a: 'Cost comes from volume. Filter cheaply before scoring expensively, cache stable inputs, cap calls per run, and track cost per user per day rather than only the total.',
    },
    {
      q: 'How do I know a smaller model is good enough for a step?',
      a: 'Fifty labelled examples for that route. It answers the question in an afternoon, which is the only honest way to make the decision.',
    },
    {
      q: 'Should parallel tool calls just be executed?',
      a: 'Decide per tool. Concurrency is a useful speedup for reads and a hazard for writes, so safety should be a property of the tool rather than of the order things arrived.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-claude', 'how-to-build-an-ai-job-agent-with-gemini', 'how-to-build-an-ai-agent-that-uses-tools-to-search-jobs'],
};

export default post;

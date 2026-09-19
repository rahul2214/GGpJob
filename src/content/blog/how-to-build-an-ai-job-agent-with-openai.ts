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
  excerpt:
    'The features that matter for an agent are the boring ones: reliable tool calling and guaranteed output shapes.',
  sections: [
    {
      heading: 'Structured output is the feature to build on',
      paragraphs: [
        'A job agent needs data, not prose: extracted requirements, scored matches, parsed profile fields. Asking for JSON in a prompt and parsing what comes back fails often enough to be a real source of incidents.',
        'Schema-constrained output removes that failure mode. Define the shape, receive it reliably, and drop the defensive parsing, repair prompts and retry loops that otherwise accumulate around every extraction step.',
      ],
    },
    {
      heading: 'Function calling is the tool layer',
      paragraphs: [
        'Describe your tools, let the model choose, execute, return the result, continue. That loop is the agent, and its reliability depends mostly on how well the tools are described rather than on the model.',
        'Name parameters so their meaning is obvious, keep the tool count modest, and make required parameters few. A poorly named parameter produces a confidently wrong call, and it looks like a model failure when it is a documentation failure.',
      ],
      bullets: [
        'Clear tool names describing the effect',
        'Few required parameters, obvious from their names',
        'Error returns that state what would be valid',
        'Limits enforced in your code, never by the description',
      ],
    },
    {
      heading: 'Match the model to the task',
      paragraphs: [
        'Using the largest model for everything is the most common way to overspend. Classifying a reply, extracting fields from a posting and formatting a summary are easy tasks that smaller models handle at a fraction of the cost.',
        'Reserve the strongest model for the genuinely hard judgements: whether transferable experience satisfies a requirement, or how to phrase an achievement for a specific role. Route per task, and measure quality per route rather than assuming.',
      ],
    },
    {
      heading: 'Control cost structurally',
      paragraphs: [
        'Cost problems in agents come from volume, not from single calls. An agent scoring two hundred postings per user per day at a few cents each is a number that surprises people at the end of the month.',
        'Cache aggressively on stable inputs, keep long shared prefixes stable so provider-side caching can apply, cap calls per run in code, and set spending alerts. Do this before launch: the alternative is discovering the shape of your costs from an invoice.',
      ],
    },
    {
      heading: 'Keep the provider swappable',
      paragraphs: [
        'Provider-specific types spread through a codebase quickly, and then a price change, an outage or a better model elsewhere becomes a migration project rather than a configuration change.',
        'Put one adapter between your agent and the API, express tools and outputs in your own types, and keep everything provider-shaped behind that seam. It costs a small amount now and preserves an option worth having.',
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
      a: 'Cost comes from volume. Cache stable inputs, keep long prefixes stable for provider caching, cap calls per run in code, and set alerts before launch.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-claude', 'how-to-build-an-ai-job-agent-with-gemini', 'how-to-build-an-ai-agent-that-uses-tools-to-search-jobs'],
};

export default post;

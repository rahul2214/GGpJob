import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-multi-agent-job-search-system',
  tint: 'indigo',
  title: 'How to Build a Multi-Agent Job Search System',
  heading: 'Multi-agent job search',
  description:
    'Splitting a job search into specialised agents: sensible boundaries, how they communicate, who holds authority, and the costs that surprise people.',
  keywords: [
    'multi agent job search',
    'multi agent system design',
    'agent orchestration',
    'specialised agents',
    'agent communication',
    'orchestrator agent',
    'multi agent cost',
    'agent handoff',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Multiple agents are worth it when the subtasks genuinely differ. They are not a way to make one unreliable agent reliable by cloning it.',
  sections: [
    {
      heading: 'Split by capability, not by step',
      paragraphs: [
        'The common mistake is one agent per pipeline stage: a search agent, a scoring agent, a writing agent, a submission agent. That is a workflow, and a workflow does not need agents — it needs functions, which are cheaper and deterministic.',
        'Split where the work genuinely differs in kind. Browsing an unfamiliar site is a different competence from judging whether a CV meets a requirement, and different again from writing a cover letter. Those boundaries justify separate agents with separate tools and prompts.',
      ],
    },
    {
      heading: 'Give one component authority',
      paragraphs: [
        'Agents that negotiate with each other produce impressive transcripts and unpredictable outcomes. Someone has to decide, and that someone should be an orchestrator with plain logic rather than a committee of models.',
        'Keep the orchestrator dumb on purpose: it routes, it enforces limits, it decides when to stop. Every piece of judgement is delegated to a specialist, and every piece of control stays in code where it can be audited.',
      ],
      bullets: [
        'Orchestrator: routing, budgets, stopping conditions — deterministic',
        'Specialists: one competence each, narrow tools',
        'No agent-to-agent messaging that bypasses the orchestrator',
        'All state changes recorded centrally, not inside an agent',
      ],
    },
    {
      heading: 'Pass structured results, not conversation',
      paragraphs: [
        'When one agent hands another a free-text summary, detail is lost and errors compound — the second agent acts on a paraphrase of a paraphrase, and by the fourth handoff nobody can reconstruct what was decided.',
        'Define a schema for each handoff and validate it. A scoring agent returns scored identifiers with reasons, not a paragraph about what it thought. This also makes each agent independently testable, which a conversational handoff never is.',
      ],
    },
    {
      heading: 'Count the cost honestly',
      paragraphs: [
        'Each agent has its own context, its own prompt and its own reasoning tokens. Five agents is not five times the cost of one — it is more, once handoffs, retries and the orchestrator’s own calls are counted.',
        'The multi-agent version has to be enough better to justify that. Often a single well-prompted agent with good tools matches it, and the only honest way to know is to build the simple version first and measure what the split buys.',
      ],
    },
    {
      heading: 'Debugging is the real tax',
      paragraphs: [
        'When a single agent misbehaves you read its trace. When five agents interact, the question is which one went wrong, which handoff carried the error, and whether the orchestrator should have caught it.',
        'Budget for this before you build. Log every handoff with its full input and output, tag every message with a run identifier, and make each agent runnable in isolation against a recorded input. Without that, a multi-agent system becomes unmaintainable well before it becomes impressive.',
      ],
    },
  ],
  faqs: [
    {
      q: 'When is a multi-agent job search worth building?',
      a: 'When subtasks differ in kind — browsing an unfamiliar site, judging requirement fit, writing a letter. One agent per pipeline stage is just a workflow, and workflows want functions, not agents.',
    },
    {
      q: 'Should agents negotiate with each other?',
      a: 'No. Give a deterministic orchestrator authority over routing, budgets and stopping, and delegate only judgement to specialists. Negotiating agents produce good transcripts and unpredictable outcomes.',
    },
    {
      q: 'How should agents hand work to each other?',
      a: 'Through validated schemas, not free text. Scored identifiers with reasons, not a paragraph — otherwise detail is lost at each hop and no agent can be tested in isolation.',
    },
    {
      q: 'Is multi-agent more expensive than a single agent?',
      a: 'Materially, yes — each agent carries its own context and prompt, plus handoffs, retries and orchestrator calls. Build the single-agent version first and measure what the split actually buys.',
    },
  ],
  related: ['single-agent-vs-multi-agent-job-search', 'how-to-build-a-multi-agent-recruitment-platform', 'how-to-build-reliable-ai-agents'],
};

export default post;

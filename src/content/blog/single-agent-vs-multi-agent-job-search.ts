import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'single-agent-vs-multi-agent-job-search',
  tint: 'indigo',
  title: 'Single AI Agent vs Multi-Agent Job Search Architecture',
  heading: 'One agent or several?',
  description:
    'An honest comparison: what a single agent handles well, what genuinely needs splitting, the costs of each, and how to tell which you are looking at.',
  keywords: [
    'single agent vs multi agent',
    'agent architecture comparison',
    'when to split agents',
    'multi agent tradeoffs',
    'agent context limits',
    'agent complexity',
    'job search architecture',
    'agent design decision',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['one agent or several', 'reasons to split'],
  excerpt:
    'Most teams reach for multiple agents too early, for a problem that was really a tool design problem.',
  keyTakeaways: [
    'A single agent holds the whole task in view, which is worth more than it sounds.',
    'Three legitimate reasons to split: context, capability, isolation.',
    'Splitting an unreliable agent produces several unreliable agents plus handoff loss.',
    'Neither list of costs is short, which is why the decision deserves evidence.',
    'Build the single version, instrument it, and let the actual failure name the boundary.',
  ],
  sections: [
    {
      heading: 'Start with one',
      paragraphs: [
        'A single agent with a clear prompt and well-designed tools handles more than people expect. It has one context, so nothing is lost in translation; one place to debug; one cost to reason about.',
        'Crucially, it can hold the whole task in view. It knows that the role it is writing a letter for is the one it scored highly an hour ago, without anyone having to pass that fact along.',
        'Much of a job search pipeline does not need an agent at all, which is worth checking first. Fetching, deduplicating, filtering and submitting are deterministic steps with one correct answer, and expressing them as functions is cheaper and more reliable than routing them through any number of agents.',
      ],
    },
    {
      heading: 'The three reasons to split',
      paragraphs: [
        'There are legitimate reasons, and they are narrower than the enthusiasm suggests. Context pressure: the task genuinely does not fit, and summarising loses what matters. Capability difference: one subtask needs a browser and a different model than the rest. Isolation: one subtask handles untrusted content and should not share a context with anything that can act.',
        'That third reason is the strongest and the least discussed. An agent reading arbitrary web pages should not be the same agent holding the credential that submits applications, because then a page that manipulates the reader can also manipulate the submitter.',
        'Cost is a fourth reason people do not state but act on. Routing cheap classification to a small model and hard judgement to a large one is a form of splitting, and it is usually a better first move than decomposing the reasoning itself.',
      ],
      bullets: [
        'Context does not fit and summarising loses the substance',
        'A subtask needs different tools, a different model or different latency',
        'A subtask handles untrusted input and must be isolated from action',
      ],
      table: {
        caption: 'What each architecture costs',
        columns: ['Concern', 'Single agent', 'Multi-agent'],
        rows: [
          ['Context over a long run', 'Grows and degrades', 'Bounded per agent'],
          ['Debugging', 'One trace', 'Which agent, which handoff'],
          ['Cost', 'Lower', 'More than the sum'],
          ['Latency', 'Lower', 'Sequential waits compound'],
          ['Isolation from untrusted input', 'None', 'The main benefit'],
          ['Failure handling', 'It failed', 'Partial success to reconcile'],
        ],
      },
    },
    {
      heading: 'The reasons that are not reasons',
      paragraphs: [
        'Splitting because the agent is unreliable rarely helps: three unreliable agents with handoffs between them are less reliable, not more, because errors now propagate through paraphrase. The fix for unreliability is better tools, clearer prompts and validation, not more participants.',
        'Splitting because the architecture diagram looks better is also common and worth naming. A diagram with five boxes is not evidence of a better system.',
        'One agent per pipeline stage is the specific anti-pattern. If a component always runs in the same place with the same input and output shape, it is a function with a model call inside it, and calling it an agent adds ceremony without adding agency.',
      ],
    },
    {
      heading: 'If you do split, split properly',
      paragraphs: [
        'Give one component authority. A deterministic orchestrator that routes, enforces budgets and decides when to stop is far more predictable than agents negotiating with each other, which produces impressive transcripts and unpredictable outcomes.',
        'Pass validated schemas rather than free text. A scoring agent should return scored identifiers with reasons, not a paragraph about what it concluded — otherwise detail is lost at each hop and no agent can be tested in isolation.',
        'Decide in advance what happens when one specialist fails. Partial success is the common case: scoring succeeded and generation failed, and repeating the expensive scoring on retry is pure waste, so checkpoint after each handoff.',
        'Budget for the debugging tax before you build. Log every handoff with its full input and output, tag everything with a run identifier, and make each agent runnable in isolation against a recorded input — those recordings then double as a regression suite.',
      ],
    },
    {
      heading: 'What each costs',
      paragraphs: [
        'Single agent: context grows through a long run, one bad decision affects everything downstream, and there is no isolation between reading untrusted content and taking action.',
        'Multi-agent: more tokens, handoff losses, harder debugging, and orchestration code that becomes its own source of bugs. Neither list is short, which is why the decision deserves evidence rather than preference.',
        'Latency is the cost users feel first. Sequential agents each waiting on a model call turn a four-second operation into thirty, and nobody watching a spinner is consoled by the elegance of the decomposition.',
      ],
    },
    {
      heading: 'A practical way to decide',
      paragraphs: [
        'Build the single-agent version. Instrument it. Find where it actually fails — not where you imagine it might — and check whether that failure is a context limit, a capability gap or an isolation problem.',
        'If it is none of those, it is a tool or prompt problem, and splitting will not fix it. If it is one of them, you now know exactly where the boundary goes, which is a far better starting point than guessing at a diagram.',
        'Split at that one boundary rather than redesigning around it. Most systems that genuinely need more than one agent need exactly two, and arriving at five is usually a sign the decision was made from a diagram rather than from a trace.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I start with one agent or several?',
      a: 'One. A single agent holds the whole task in view, has one context to debug and one cost to reason about — and much of the pipeline needs functions rather than agents anyway.',
    },
    {
      q: 'What are legitimate reasons to split into multiple agents?',
      a: 'Context that genuinely does not fit, a subtask needing different tools or models, and isolation — keeping an agent that reads untrusted pages away from one holding credentials that submit.',
    },
    {
      q: 'Will splitting fix an unreliable agent?',
      a: 'No. Three unreliable agents with handoffs are less reliable, since errors now propagate through paraphrase. Unreliability is fixed with better tools, clearer prompts and validation.',
    },
    {
      q: 'How do I decide in practice?',
      a: 'Build the single-agent version, instrument it, and find where it actually fails. Then split at that one boundary rather than redesigning around a diagram.',
    },
    {
      q: 'What is the anti-pattern to avoid?',
      a: 'One agent per pipeline stage. A component that always runs in the same place with the same shapes is a function with a model call inside it.',
    },
    {
      q: 'If I do split, what matters most?',
      a: 'A deterministic orchestrator with authority, validated schemas at every handoff, a decided failure policy, and checkpoints so a retry resumes rather than repeats.',
    },
  ],
  related: ['how-to-build-a-multi-agent-job-search-system', 'how-to-build-reliable-ai-agents', 'ai-agent-security-permissions-sandboxing'],
};

export default post;

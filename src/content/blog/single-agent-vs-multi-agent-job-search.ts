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
  excerpt:
    'Most teams reach for multiple agents too early, for a problem that was really a tool design problem.',
  sections: [
    {
      heading: 'Start with one',
      paragraphs: [
        'A single agent with a clear prompt and well-designed tools handles more than people expect. It has one context, so nothing is lost in translation; one place to debug; one cost to reason about.',
        'Crucially, it can hold the whole task in view. It knows that the role it is writing a letter for is the one it scored highly an hour ago, without anyone having to pass that fact along.',
      ],
    },
    {
      heading: 'The three reasons to split',
      paragraphs: [
        'There are legitimate reasons, and they are narrower than the enthusiasm suggests. Context pressure: the task genuinely does not fit, and summarising loses what matters. Capability difference: one subtask needs a browser and a different model than the rest. Isolation: one subtask handles untrusted content and should not share a context with anything that can act.',
        'That third reason is the strongest and the least discussed. An agent reading arbitrary web pages should not be the same agent holding the credential that submits applications, because then a page that manipulates the reader can also manipulate the submitter.',
      ],
      bullets: [
        'Context does not fit and summarising loses the substance',
        'A subtask needs different tools, a different model or different latency',
        'A subtask handles untrusted input and must be isolated from action',
      ],
    },
    {
      heading: 'The reasons that are not reasons',
      paragraphs: [
        'Splitting because the agent is unreliable rarely helps: three unreliable agents with handoffs between them are less reliable, not more, because errors now propagate through paraphrase. The fix for unreliability is better tools, clearer prompts and validation, not more participants.',
        'Splitting because the architecture diagram looks better is also common and worth naming. A diagram with five boxes is not evidence of a better system.',
      ],
    },
    {
      heading: 'What each costs',
      paragraphs: [
        'Single agent: context grows through a long run, one bad decision affects everything downstream, and there is no isolation between reading untrusted content and taking action.',
        'Multi-agent: more tokens, handoff losses, harder debugging, and orchestration code that becomes its own source of bugs. Neither list is short, which is why the decision deserves evidence rather than preference.',
      ],
    },
    {
      heading: 'A practical way to decide',
      paragraphs: [
        'Build the single-agent version. Instrument it. Find where it actually fails — not where you imagine it might — and check whether that failure is a context limit, a capability gap or an isolation problem.',
        'If it is none of those, it is a tool or prompt problem, and splitting will not fix it. If it is one of them, you now know exactly where the boundary goes, which is a far better starting point than guessing at a diagram.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I start with one agent or several?',
      a: 'One. A single agent holds the whole task in view, has one context to debug and one cost to reason about — and it handles more than most people expect with good tools.',
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
      a: 'Build the single-agent version, instrument it, and find where it actually fails. If the failure is not a context limit, a capability gap or an isolation need, splitting will not help.',
    },
  ],
  related: ['how-to-build-a-multi-agent-job-search-system', 'how-to-build-reliable-ai-agents', 'ai-agent-security-permissions-sandboxing'],
};

export default post;

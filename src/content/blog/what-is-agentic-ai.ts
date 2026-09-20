import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-agentic-ai',
  tint: 'sky',
  title: 'What Is Agentic AI? A Beginner’s Guide',
  heading: 'What agentic AI actually means',
  description:
    'Agentic AI means a model that plans, acts and reacts in a loop rather than answering once. Here is what changes, what breaks, and where the label is oversold.',
  keywords: [
    'what is agentic ai',
    'agentic ai explained',
    'ai agent vs llm',
    'agentic ai beginner guide',
    'autonomous ai agents',
    'agentic workflow',
    'agentic ai examples',
    'ai agent loop',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['agentic AI', 'agentic system'],
  excerpt:
    'The word is applied to everything from a two-step script to genuine autonomy. The distinction that matters is whether the system decides its own next step.',
  keyTakeaways: [
    'It is agentic only when the model chooses the next step, not when your code fixes the sequence.',
    'Every framework is the same four parts: a goal, tools, a loop, and stopping conditions.',
    'Errors compound because each step becomes the premise for the next — agents drift confidently.',
    'Use it where the step count is unknown and mistakes are cheap; otherwise write the pipeline.',
    'Every system working in production today is narrow, bounded and has a human on irreversible actions.',
  ],
  sections: [
    {
      heading: 'The definition that survives contact with reality',
      paragraphs: [
        'A plain language model answers once: text in, text out. An agentic system runs a loop — it decides on an action, takes it, observes what happened, and decides again, until it judges the task done or something stops it.',
        'The load-bearing word is decides. If your code fixes the sequence — retrieve, summarise, email — that is a pipeline with a model in it, no matter what the marketing says. It becomes agentic when the model chooses which step comes next, and can choose differently based on what it just saw.',
        'This is worth being pedantic about because the two have completely different engineering profiles. A pipeline is testable, repeatable and cheap to debug. An agent is none of those, and adopting one where a pipeline would do is a decision that costs months.',
      ],
    },
    {
      heading: 'What the loop actually contains',
      paragraphs: [
        'Every agent framework is a variation on the same four parts. Knowing them makes it much easier to read any product claim and work out what is really being offered.',
        'Most of the engineering effort goes into the last two. Deciding what to do is what models are good at; doing it reliably, safely and within a budget is what the surrounding system has to provide.',
        'Frameworks differ mainly in how much of that surrounding system they supply. That is worth checking before adopting one, because the parts they leave to you — state persistence, idempotency, budget enforcement — are the parts that determine whether the thing survives production.',
      ],
      bullets: [
        'A goal, stated once by the user',
        'A set of tools, each with a description the model selects from',
        'A loop that feeds each result back as the next input',
        'Stopping conditions — success, a step limit, a budget, or a human saying no',
      ],
    },
    {
      heading: 'Why errors behave differently',
      paragraphs: [
        'In a single-shot system a mistake is contained: you get one wrong answer and you can see it. In a loop, step three is built on step two, so a small early error becomes the premise for everything after it. Agents fail by drifting confidently rather than by stopping.',
        'This is why agent reliability is discussed in terms of trajectories rather than outputs. An agent that reaches the right answer after forty tool calls and two destructive mistakes has not succeeded, even though the final message looks fine.',
        'The arithmetic is worth internalising. A step that is right 95% of the time is right about 60% of the time across ten dependent steps and about 36% across twenty. That single calculation explains most of the gap between agent demos and agent deployments.',
      ],
      table: {
        caption: 'Why step count dominates agent reliability',
        columns: ['Per-step accuracy', '5 steps', '10 steps', '20 steps'],
        rows: [
          ['90%', '59%', '35%', '12%'],
          ['95%', '77%', '60%', '36%'],
          ['99%', '95%', '90%', '82%'],
        ],
      },
    },
    {
      heading: 'What makes the good ones work',
      paragraphs: [
        'Given that arithmetic, the systems that succeed do one of two things: they reduce the number of dependent steps, or they verify each one so an error cannot become the next premise.',
        'Coding agents are the clearest success because the environment verifies them for free. A test suite reports failure at the step that caused it, which breaks the compounding chain — the agent is corrected immediately rather than building on a mistake.',
        'That generalises into the most useful question you can ask of any proposed agent use: does the environment tell the agent when it is wrong? Where the answer is yes, agents work far better than the raw numbers suggest. Where it is no, they fail invisibly.',
      ],
    },
    {
      heading: 'Where it genuinely earns its complexity',
      paragraphs: [
        'Agentic design pays off when the number of steps cannot be known in advance and the cost of a wrong step is low or reversible. Research across an unknown number of sources, triaging a queue of varied items, exploring a codebase to answer a question — these have no fixed script, so letting the model choose is a real gain.',
        'It pays off badly when the task is already well defined. If you know the steps, write the steps. A deterministic pipeline is cheaper, faster, testable and debuggable, and choosing an agent instead buys you unpredictability you will spend months managing.',
        'A reasonable default is to build the pipeline first and let it fail. The places where it cannot cope — where the right next step genuinely depends on what the last one returned — are exactly where an agent belongs, and you will have identified them from evidence rather than from enthusiasm.',
      ],
    },
    {
      heading: 'The honest state of it',
      paragraphs: [
        'Demos are far ahead of deployments, and the gap is not about model capability. It is that autonomy multiplies the consequences of being wrong, so anything touching money, messages or permanent records ends up with a human in the loop — at which point much of the promised time saving goes back.',
        'The systems working in production today are narrow: a bounded task, a handful of tools, tight limits, and a person approving anything irreversible. That is less exciting than the pitch and considerably more useful, and it is the version worth learning to build.',
        'The right posture is neither dismissal nor enthusiasm. Agents are a genuine capability with a well-understood failure mode, and teams that design around the failure mode rather than hoping it improves are the ones shipping things that work.',
      ],
      bullets: [
        'Narrow scope beats general autonomy in every shipped system so far',
        'Fewer, well-described tools outperform many granular ones',
        'Step and cost ceilings are features, not limitations',
        'Human approval gates are where most real deployments draw the line',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between an LLM and an agentic AI system?',
      a: 'An LLM answers once. An agentic system puts that model in a loop where it chooses an action, sees the result and chooses again. The distinguishing feature is that the model decides the sequence rather than following one you wrote.',
    },
    {
      q: 'Is every AI workflow agentic?',
      a: 'No. If the steps are fixed in your code, it is a pipeline containing a model — which is often the better engineering choice. It is agentic only when the next step is the model’s decision.',
    },
    {
      q: 'Why do agents fail more confusingly than chatbots?',
      a: 'Because errors compound. Each step becomes the premise for the next, so a small early mistake propagates and the agent continues confidently. That is why evaluation looks at the whole trajectory, not just the final answer.',
    },
    {
      q: 'When should I not build an agent?',
      a: 'When you already know the steps. A deterministic pipeline is cheaper, faster and far easier to test and debug; reaching for an agent there buys unpredictability with no corresponding gain.',
    },
    {
      q: 'Why do coding agents work so much better than others?',
      a: 'Because the environment verifies them. A test suite reports failure at the step that caused it, which breaks the compounding chain instead of letting an error become the next premise.',
    },
    {
      q: 'How do I decide whether a task suits an agent?',
      a: 'Build the pipeline first and see where it cannot cope. The places where the right next step genuinely depends on the last result are where an agent belongs — identified from evidence rather than enthusiasm.',
    },
  ],
  related: ['what-are-ai-agents', 'ai-agents-vs-assistants-vs-chatbots', 'how-to-build-reliable-ai-agents'],
  references: [
    {
      title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
      url: 'https://arxiv.org/abs/2210.03629',
      publisher: 'arXiv',
      note: 'The reason-then-act loop most agent frameworks are based on.',
    },
  ],
};

export default post;

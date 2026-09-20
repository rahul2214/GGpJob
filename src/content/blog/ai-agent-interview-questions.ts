import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-agent-interview-questions',
  tint: 'sky',
  title: 'AI Agent Interview Questions: What Teams Actually Ask',
  heading: 'AI agent interview questions',
  description:
    'Interview questions on AI agents: tool design, loop control, failure recovery, permissions and evaluation — with what interviewers are listening for.',
  keywords: [
    'ai agent interview questions',
    'agentic ai interview',
    'llm agent interview questions',
    'tool calling interview',
    'ai agent system design',
    'agent architecture questions',
    'multi agent interview questions',
    'ai agent evaluation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  anchors: ['agent interview', 'loop control'],
  excerpt:
    'Agent interviews are mostly about control. Anyone can make a model call a tool; the questions are about what happens when it calls the wrong one, repeatedly.',
  keyTakeaways: [
    'Every question converges on control, because agents act in a loop and errors compound.',
    'Termination is the question most likely to expose inexperience.',
    'Tool design is about granularity and descriptions, not about exposing your API.',
    'Evaluate the trajectory, not just the final answer — a correct result via an unsafe path is a failure.',
    'On multi-agent questions, the correct answer is less fashionable than the expected one.',
  ],
  sections: [
    {
      heading: 'The theme running through every question',
      paragraphs: [
        'Agents differ from ordinary model calls in one respect that drives everything: they take actions in a loop, and each action changes the state the next decision is made from. Errors compound instead of being isolated to one response.',
        'Interviewers know this, so questions converge on control. How does the loop end? What happens when a step fails? What can it do that you would not want it to do twice? Candidates who describe capability without constraint are signalling they have only built demos.',
        'The arithmetic is worth having ready. A step that succeeds 95% of the time succeeds about 60% of the time across ten dependent steps, which is why the interesting engineering is in verification and limits rather than in reasoning quality.',
      ],
    },
    {
      heading: 'Tool design questions',
      paragraphs: [
        'Expect to be asked how you would design the tools available to an agent. The naive answer exposes every API endpoint. The experienced answer recognises that a model chooses tools by reading short descriptions, so many similar tools produce confusion rather than capability.',
        'Strong candidates talk about granularity — task-shaped tools rather than primitive ones — and about error messages written for a reader who must decide what to do differently on the next attempt.',
        'The point that most often impresses is that a tool returning "Bad Request" guarantees a retry loop, whereas one returning "seniority must be junior, mid or senior — received lead" is recovered from on the next call. Tool ergonomics is a reliability feature, not a nicety.',
      ],
      bullets: [
        'How many tools is too many, and why?',
        'How would you name and describe a tool so the model picks it correctly?',
        'What should a tool return when it fails?',
        'How do you stop an agent chaining tools in a nonsensical order?',
        'Which actions should require confirmation rather than being callable directly?',
      ],
    },
    {
      heading: 'Loop control and termination',
      paragraphs: [
        'This is the question most likely to expose inexperience. Agents that loop indefinitely, retry the same failing call, or declare success without achieving anything are the standard failure modes, and everyone who has run one in production has met all three.',
        'Good answers cover explicit step limits, detecting repeated identical actions, budget ceilings in both tokens and time, and — importantly — what the system does when it hits a limit. Stopping silently is its own failure; escalating with context is the answer.',
        'Add that the limits belong in code rather than in the prompt. An instruction to stop after twenty steps is a suggestion the model can reason its way past; a counter that refuses the twenty-first call is a control.',
      ],
    },
    {
      heading: 'Permissions and blast radius',
      paragraphs: [
        'Expect a security-flavoured question, often framed as an agent that took a damaging action. Interviewers want to hear that the control is architectural rather than a better instruction.',
        'The reasoning that lands is that an agent influenced by untrusted text cannot be reliably instructed into safety, so the boundary must be what it is permitted to do at all. Narrow credentials, reversible operations by default, and confirmation gates on anything destructive.',
        'The strongest structural answer is separating the component that reads untrusted content from the one that can act. If the reader only emits a typed proposal that a validator checks against policy, a successful injection has nowhere to go even when it works perfectly.',
      ],
      bullets: [
        'What could this agent do that you could not undo?',
        'How do you scope credentials for an agent acting on a user’s behalf?',
        'What happens if retrieved content contains instructions?',
        'How would you audit what an agent did and why?',
      ],
      table: {
        caption: 'What interviewers hear in each answer',
        columns: ['Topic', 'Signals a demo', 'Signals production experience'],
        rows: [
          ['Tools', 'Exposed the whole API', 'Few task-shaped tools, instructive errors'],
          ['Termination', 'The model decides when done', 'Step, time and cost ceilings in code'],
          ['Failure', 'Retry until it works', 'Distinguishes retryable from permanent'],
          ['Security', 'Filter malicious input', 'Reader and actor are separate components'],
          ['Evaluation', 'Check the final answer', 'Score the trajectory and the cost'],
          ['Multi-agent', 'More agents, more capability', 'One agent until a specific need appears'],
        ],
      },
    },
    {
      heading: 'Evaluation, which is harder here',
      paragraphs: [
        'Evaluating a single response is difficult; evaluating a trajectory is harder. An agent can reach a correct answer through a wasteful or unsafe path, and scoring only the final output misses that entirely.',
        'Mentioning that you would evaluate both the outcome and the path — steps taken, tools called, cost incurred — demonstrates thinking most candidates skip. It also naturally leads into cost, since an agent that succeeds after forty tool calls may be commercially useless.',
        'Cost per completed task is the metric to name. Cost per model call looks reassuring and hides the retries, and an agent that is cheap per call and takes thirty calls to finish is not a cheap agent.',
      ],
    },
    {
      heading: 'Multi-agent questions, and the honest answer',
      paragraphs: [
        'You may be asked when to use multiple agents. There is a fashionable answer and a correct one, and interviewers with production experience prefer the correct one.',
        'Multiple agents add coordination overhead, more failure modes and considerably more cost. They are justified when sub-tasks genuinely need different tools or permissions. Saying that you would start with one agent and split only when a specific problem demanded it is a stronger answer than enthusiasm for elaborate architectures.',
        'The one genuinely strong argument for splitting is isolation. Keeping the component that reads untrusted web content away from the component holding credentials is a security boundary, and that reason survives scrutiny where "separation of concerns" does not.',
      ],
    },
    {
      heading: 'How to prepare',
      paragraphs: [
        'Build one agent with two or three real tools and let it fail. Watch it loop, call the wrong tool and misread an error. Those observations give you concrete answers no amount of reading provides.',
        'Keep the trace of a run that went wrong. Being able to describe a specific bad trajectory, what caused it and what you changed is the most persuasive thing you can bring to this interview.',
        'Give it a tool that touches something real, even a local file. The moment an agent can change state rather than only produce text, every question in this article stops being abstract and you will have opinions worth stating.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most common AI agent interview question?',
      a: 'How you stop the loop. Termination, step limits, repeated-action detection and what happens when a budget is exhausted come up in almost every agent interview because they are the standard production failures.',
    },
    {
      q: 'How many tools should an agent have?',
      a: 'Fewer than most people expect. Models select by reading short descriptions, so many similar tools cause confusion. Task-shaped tools with clear descriptions outperform many primitive ones requiring correct chaining.',
    },
    {
      q: 'How do you evaluate an AI agent?',
      a: 'On both outcome and trajectory. An agent can reach the right answer through a wasteful or unsafe path, so score the steps taken, tools called and cost incurred alongside the final result.',
    },
    {
      q: 'When should you use multiple agents?',
      a: 'When sub-tasks genuinely need different tools or permissions. Multiple agents add coordination overhead, failure modes and cost, so start with one and split only when a specific problem requires it.',
    },
    {
      q: 'Where should agent limits live?',
      a: 'In code, not the prompt. An instruction to stop after twenty steps is a suggestion the model can reason past; a counter refusing the twenty-first call is a control.',
    },
    {
      q: 'Which cost metric should I quote?',
      a: 'Cost per completed task. Cost per model call hides retries, and an agent that is cheap per call and needs thirty calls is not cheap.',
    },
  ],
  related: ['ai-engineer-interview-questions', 'what-are-ai-agents', 'mcp-explained-for-developers'],
  references: [
    {
      title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
      url: 'https://arxiv.org/abs/2210.03629',
      publisher: 'arXiv',
      note: 'The reason-then-act loop most agent frameworks are built on.',
    },
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'Covers excessive agency and injection, which is what the security questions are drawn from.',
    },
    {
      title: 'Model Context Protocol',
      url: 'https://modelcontextprotocol.io/',
      publisher: 'Model Context Protocol',
      note: 'Useful background for tool design questions, since it formalises how tools are described.',
    },
  ],
};

export default post;

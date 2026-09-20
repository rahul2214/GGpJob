import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-are-ai-agents',
  tint: 'sky',
  title: 'What Are AI Agents? And What They Mean for Work',
  heading: 'What AI agents are, and what they change',
  description:
    'What AI agents actually are, how they differ from chatbots, where they genuinely work today, and which parts of a job they change first.',
  keywords: [
    'what are ai agents',
    'ai agents explained',
    'agentic ai',
    'ai agents vs chatbots',
    'ai agents for business',
    'will ai agents replace jobs',
    'autonomous ai agents',
  ],
  publishedAt: '2026-09-08',
  updatedAt: '2026-09-08',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'AGI & Future',
  anchors: ['AI agents', 'AI agent'],
  excerpt:
    'Agents are the most hyped idea in AI right now and the least precisely defined. Here is what actually distinguishes them, and where they work.',
  keyTakeaways: [
    'An agent is given a goal and takes multiple steps on its own; a chatbot answers the message in front of it.',
    'Reliability falls off with step count — 95% per step is roughly 60% across ten dependent steps.',
    'They work where the environment is constrained, mistakes are cheap, and a human reads the result.',
    'The near-term effect on jobs is compressing the routine middle of roles, not removing whole roles.',
    'The scarce skill is judging whether the output is right, which needs domain knowledge, not tooling knowledge.',
  ],
  sections: [
    {
      heading: 'The actual distinction',
      paragraphs: [
        'A chatbot responds to what you send it. An agent is given a goal and takes multiple steps toward it on its own — calling tools, reading results, deciding what to do next, and continuing until it finishes or fails.',
        'The important word is steps. Once a system acts repeatedly without checking in, small errors compound. A model that is right 95% of the time per step is right about 60% of the time across ten dependent steps, which is why agent demos impress and agent deployments disappoint.',
        'That arithmetic is the single most useful thing to carry into any conversation about agents. It explains why the impressive five-step demo does not survive being turned into a twenty-step workflow, and why serious deployments spend most of their engineering effort on verification rather than on reasoning.',
      ],
    },
    {
      heading: 'The three things that make something an agent',
      paragraphs: [
        'Stripped of marketing, the definition needs only three properties. The system has a goal rather than a prompt. It can act on the world through tools, not just emit text. And it decides its own next step from what the last one returned.',
        'Remove any one and you have something simpler with a clearer name. No tools and it is a chatbot. No self-direction and it is a workflow, which is usually better — workflows are deterministic, testable and cheaper. No goal and it is an autocomplete.',
        'This matters commercially because a great deal of software is currently marketed as agentic when it is a workflow with a model in one step. That is not a criticism of the software; a workflow is frequently the right design. It is a reason to read what a product does rather than what it is called.',
      ],
      bullets: [
        'A goal, not a single instruction',
        'Tools that change something outside the model',
        'Its own choice of next step, based on the last result',
      ],
    },
    {
      heading: 'Where they genuinely work today',
      paragraphs: [
        'Agents work well where the environment is constrained, mistakes are cheap or reversible, and a human reviews the result. They work badly where a wrong step is expensive and nobody is watching.',
        'Coding is the clearest success because the environment supplies its own verification. A test suite tells the agent immediately whether the last step was wrong, so errors are caught at the step that produced them rather than compounding silently through the next nine.',
        'That generalises into a rule worth applying to any proposed agent use: does the environment tell the agent when it is wrong? Where the answer is yes, agents work far better than the step-count arithmetic alone predicts. Where it is no, they fail in ways nobody notices until later.',
      ],
      bullets: [
        'Coding assistants that run tests and iterate — errors surface immediately',
        'Research and summarisation across many documents, with a human reading the output',
        'Data pulling and report drafting inside a fixed set of systems',
        'Triage and routing, where a mistake is corrected downstream',
      ],
    },
    {
      heading: 'Where they still fail',
      paragraphs: [
        'The failure modes are consistent enough to list. Agents lose the thread on long tasks as context fills. They act confidently on a misread instruction rather than asking. They cannot tell a temporary failure from a permanent one, so they retry things that will never work.',
        'And they are vulnerable to what they read. An agent that browses the web or reads documents is consuming text written by people who may be addressing the agent rather than the reader — which is a genuine security problem, not a theoretical one, once the agent can also take actions.',
        'None of this makes agents useless. It makes the boundary clear: the more consequential and irreversible the action, the more the design should route it through a person.',
      ],
    },
    {
      heading: 'What they change about jobs',
      paragraphs: [
        'The realistic near-term effect is not replacement of roles but compression of the routine middle of them. The gathering, collating and first-drafting that occupies large parts of many jobs is exactly what agents do acceptably.',
        'What that leaves is deciding what should be done, checking whether the output is right, and being accountable for it. That is a genuine change in the shape of the work, and it disproportionately affects roles built mostly from the routine middle.',
        'It also changes what junior work looks like, which is the part worth watching. Much of the routine middle was how people learned a domain, and compressing it removes the training ground along with the tedium.',
      ],
    },
    {
      heading: 'How to tell a real deployment from a demo',
      paragraphs: [
        'Almost every agent demo works, and almost every agent demo is chosen to work. The task is short, the environment is clean, the failure path is never shown, and the person running it knows which phrasing succeeds. None of that is dishonest, but none of it tells you whether the thing survives contact with a real workload.',
        'The questions that separate the two are boring and diagnostic. How many steps does a typical real task take, and what is the success rate at that length rather than at three steps? What happens when a tool returns an error — does it retry forever, stop, or invent a result? Who sees the output before it reaches anything irreversible?',
        'Ask what it costs per completed task, not per call. Agents that look cheap per model invocation frequently take thirty invocations to finish one job, and the retries on failure are the part nobody counts. A deployment that cannot answer the cost-per-completed-task question has not been run at volume.',
      ],
      bullets: [
        'Success rate at realistic task length, not at demo length',
        'Behaviour on tool failure: stop, retry, or fabricate',
        'Cost per completed task, including retries',
        'What a human sees before anything irreversible happens',
        'How a bad run is detected after the fact',
      ],
    },
    {
      heading: 'How to position yourself',
      paragraphs: [
        'The people gaining from this are the ones who direct these systems well and check their output critically — which requires enough domain knowledge to recognise a plausible-looking wrong answer. That judgement is the scarce part, not the tooling.',
        'If you work in engineering, data or operations, being the person who can build and evaluate agent workflows is a genuinely marketable skill right now, and there are far fewer people who can do it than the discussion volume suggests.',
        'The most transferable specific skill is evaluation: deciding what correct means for an open-ended output and building something that measures it. Very few people can do this well, every team deploying agents needs it, and it is largely independent of which model or framework is current.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between an AI agent and a chatbot?',
      a: 'A chatbot responds to each message you send. An agent is given a goal and takes multiple autonomous steps toward it, using tools and deciding its next action from the results, until it completes or fails.',
    },
    {
      q: 'Will AI agents replace jobs?',
      a: 'In the near term they compress the routine middle of jobs rather than replacing whole roles. Compounding error rates across many steps mean most useful deployments still keep a human reviewing the output.',
    },
    {
      q: 'Are AI agents actually reliable?',
      a: 'Reliability drops sharply with the number of dependent steps, which is why agents perform best in constrained environments where mistakes are cheap and quickly visible, such as coding with tests.',
    },
    {
      q: 'What makes something an agent rather than a workflow?',
      a: 'A workflow follows steps you defined; an agent chooses its next step from the last result. Much software marketed as agentic is a workflow with a model in one step — which is often the better design.',
    },
    {
      q: 'Why do agents work so well for coding specifically?',
      a: 'Because the environment verifies them. A test suite reports failure at the step that caused it, so errors are caught immediately instead of compounding silently through later steps.',
    },
    {
      q: 'What skill should I build to work with agents?',
      a: 'Evaluation — defining what correct means for open-ended output and measuring it. Every team deploying agents needs it, few people do it well, and it does not go stale when the model changes.',
    },
  ],
  related: ['what-is-agentic-ai', 'will-ai-take-my-job', 'ai-agents-vs-assistants-vs-chatbots'],
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

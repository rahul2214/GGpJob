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
  excerpt:
    'Agents are the most hyped idea in AI right now and the least precisely defined. Here is what actually distinguishes them, and where they work.',
  sections: [
    {
      heading: 'The actual distinction',
      paragraphs: [
        'A chatbot responds to what you send it. An agent is given a goal and takes multiple steps toward it on its own — calling tools, reading results, deciding what to do next, and continuing until it finishes or fails.',
        'The important word is steps. Once a system acts repeatedly without checking in, small errors compound. A model that is right 95% of the time per step is right about 60% of the time across ten dependent steps, which is why agent demos impress and agent deployments disappoint.',
      ],
    },
    {
      heading: 'Where they genuinely work today',
      paragraphs: [
        'Agents work well where the environment is constrained, mistakes are cheap or reversible, and a human reviews the result. They work badly where a wrong step is expensive and nobody is watching.',
      ],
      bullets: [
        'Coding assistants that run tests and iterate — errors surface immediately',
        'Research and summarisation across many documents, with a human reading the output',
        'Data pulling and report drafting inside a fixed set of systems',
        'Triage and routing, where a mistake is corrected downstream',
      ],
    },
    {
      heading: 'What they change about jobs',
      paragraphs: [
        'The realistic near-term effect is not replacement of roles but compression of the routine middle of them. The gathering, collating and first-drafting that occupies large parts of many jobs is exactly what agents do acceptably.',
        'What that leaves is deciding what should be done, checking whether the output is right, and being accountable for it. That is a genuine change in the shape of the work, and it disproportionately affects roles built mostly from the routine middle.',
      ],
    },
    {
      heading: 'How to position yourself',
      paragraphs: [
        'The people gaining from this are the ones who direct these systems well and check their output critically — which requires enough domain knowledge to recognise a plausible-looking wrong answer. That judgement is the scarce part, not the tooling.',
        'If you work in engineering, data or operations, being the person who can build and evaluate agent workflows is a genuinely marketable skill right now, and there are far fewer people who can do it than the discussion volume suggests.',
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
  ],
  related: ['what-is-agi', 'will-ai-take-my-job', 'ai-skills-in-demand'],
};

export default post;

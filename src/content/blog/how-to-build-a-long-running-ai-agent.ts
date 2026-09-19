import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-long-running-ai-agent',
  tint: 'indigo',
  title: 'How to Build a Long-Running AI Agent for Job Applications',
  heading: 'Agents that run for weeks',
  description:
    'Durability for agents that run over days: persisted state, idempotent actions, resuming safely, budget ceilings and knowing when to stop.',
  keywords: [
    'long running ai agent',
    'durable agent execution',
    'agent state persistence',
    'idempotent agent actions',
    'agent resume after crash',
    'agent budget limits',
    'background agent jobs',
    'agent scheduling',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'A job search is not a request. It runs for weeks, across restarts and deploys, and every assumption that suits a request breaks.',
  sections: [
    {
      heading: 'It is a process, not a call',
      paragraphs: [
        'A real job search spans weeks. New postings appear daily, applications sit waiting for responses, the candidate changes their mind about what they want. None of that fits in a request-response shape.',
        'So the agent is a durable process with persisted state that survives restarts, deploys and crashes. Treat it as one from the beginning: retrofitting durability onto an in-memory agent means rewriting almost all of it.',
      ],
    },
    {
      heading: 'Every action must be idempotent',
      paragraphs: [
        'Restarts happen mid-action, and the agent cannot always tell whether the previous attempt succeeded. Without idempotency, the safe-looking choice — retry — submits a second application, and the unsafe-looking choice skips a real one.',
        'Derive a key from the candidate and the posting, record intent before acting and completion after, and check that record before every action. Then a retry is free and a crash between the two is recoverable.',
      ],
      bullets: [
        'Write intent before acting, completion after',
        'Key actions by candidate plus posting, not by run',
        'Check the record before acting, every time',
        'Treat an unknown outcome as needing human confirmation, not a retry',
      ],
    },
    {
      heading: 'Context cannot accumulate forever',
      paragraphs: [
        'An agent running for three weeks cannot carry three weeks of conversation. Naive appending hits the limit, and naive truncation drops the decision that explains everything since.',
        'Keep structured state as the source of truth — applications sent, preferences learned, jobs rejected and why — and rebuild a small working context from it for each cycle. The transcript is a log, not the memory.',
      ],
    },
    {
      heading: 'Put a ceiling on everything',
      paragraphs: [
        'An unsupervised agent with no limits and a credential is how a user discovers a large bill or forty applications they never wanted. Every one of these needs a hard ceiling in code, not a line in a prompt.',
        'Cap applications per day, tool calls per cycle and spend per week. When a ceiling is hit, stop and tell the user rather than degrading silently — a stopped agent is a recoverable situation, a silently wrong one is not.',
      ],
    },
    {
      heading: 'Define what done means',
      paragraphs: [
        'Long-running agents drift. Three weeks in, the criteria the user gave have quietly stopped matching what they want, and the agent is applying to roles they would now decline.',
        'Build in re-confirmation: a periodic check-in showing what has been done and asking whether to continue. And define real terminating conditions — an accepted offer, an expiry date, a spending cap — because an agent with no end state simply keeps going.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why do long-running agents need special design?',
      a: 'Because a job search spans weeks across restarts and deploys, which breaks every assumption that suits a request. Retrofitting durability onto an in-memory agent means rewriting nearly all of it.',
    },
    {
      q: 'How do I stop a restarted agent duplicating applications?',
      a: 'Make actions idempotent: key them by candidate and posting, write intent before acting and completion after, and check that record before every action.',
    },
    {
      q: 'How does a three-week agent handle context limits?',
      a: 'Structured state is the source of truth — applications sent, preferences learned, rejections and reasons — and a small working context is rebuilt from it each cycle. The transcript is a log, not memory.',
    },
    {
      q: 'What limits should a long-running agent have?',
      a: 'Hard ceilings in code on applications per day, tool calls per cycle and spend per week, plus real terminating conditions. On hitting one, stop and tell the user rather than degrading silently.',
    },
  ],
  related: ['how-to-build-an-ai-job-search-agent-with-langgraph', 'how-to-give-an-ai-agent-memory', 'how-to-build-reliable-ai-agents'],
};

export default post;

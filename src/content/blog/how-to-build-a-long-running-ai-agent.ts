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
  anchors: ['long-running agent', 'durable execution'],
  excerpt:
    'A job search is not a request. It runs for weeks, across restarts and deploys, and every assumption that suits a request breaks.',
  keyTakeaways: [
    'Design for durability from the start; retrofitting it means rewriting nearly everything.',
    'Idempotency turns an inevitable crash into a recoverable event rather than a duplicate application.',
    'Structured state is the memory; the transcript is a log.',
    'Ceilings on volume, calls and spend live in code, and hitting one means stopping loudly.',
    'Define terminating conditions, or the agent simply keeps going past the point of usefulness.',
  ],
  sections: [
    {
      heading: 'It is a process, not a call',
      paragraphs: [
        'A real job search spans weeks. New postings appear daily, applications sit waiting for responses, the candidate changes their mind about what they want. None of that fits in a request-response shape.',
        'So the agent is a durable process with persisted state that survives restarts, deploys and crashes. Treat it as one from the beginning: retrofitting durability onto an in-memory agent means rewriting almost all of it.',
        'In practice this looks less like one long-lived process and more like many short runs over shared state. A scheduled cycle that loads state, does a bounded amount of work, writes state and exits is far easier to deploy, restart and reason about than something that must stay alive for three weeks.',
      ],
    },
    {
      heading: 'Every action must be idempotent',
      paragraphs: [
        'Restarts happen mid-action, and the agent cannot always tell whether the previous attempt succeeded. Without idempotency, the safe-looking choice — retry — submits a second application, and the unsafe-looking choice skips a real one.',
        'Derive a key from the candidate and the posting, record intent before acting and completion after, and check that record before every action. Then a retry is free and a crash between the two is recoverable.',
        'The intent record is what handles the genuinely ambiguous case. A row saying an application was started but never completed is a question for a human, and it is far better than the two automatic answers — retry and duplicate, or skip and lose.',
      ],
      bullets: [
        'Write intent before acting, completion after',
        'Key actions by candidate plus posting, not by run',
        'Check the record before acting, every time',
        'Treat an unknown outcome as needing human confirmation, not a retry',
      ],
      table: {
        caption: 'What breaks over weeks, and the fix',
        columns: ['Assumption that suits a request', 'What happens over weeks', 'Fix'],
        rows: [
          ['State lives in memory', 'Lost on every deploy', 'Persist it'],
          ['Retry is safe', 'Duplicate applications', 'Idempotency keys'],
          ['Context accumulates', 'Hits the limit', 'Rebuild from structured state'],
          ['Cost is per request', 'Compounds unnoticed', 'Weekly ceiling in code'],
          ['Goals are fixed', 'The candidate changes', 'Periodic re-confirmation'],
          ['There is an end', 'There is not', 'Explicit terminating conditions'],
        ],
      },
    },
    {
      heading: 'Context cannot accumulate forever',
      paragraphs: [
        'An agent running for three weeks cannot carry three weeks of conversation. Naive appending hits the limit, and naive truncation drops the decision that explains everything since.',
        'Keep structured state as the source of truth — applications sent, preferences learned, jobs rejected and why — and rebuild a small working context from it for each cycle. The transcript is a log, not the memory.',
        'Being deliberate about what is promoted from the log into state is most of the design. A correction the candidate made, a constraint they stated, a category of role they rejected twice — those belong in fields that persist; the rest is history nobody needs to reread.',
      ],
    },
    {
      heading: 'Put a ceiling on everything',
      paragraphs: [
        'An unsupervised agent with no limits and a credential is how a user discovers a large bill or forty applications they never wanted. Every one of these needs a hard ceiling in code, not a line in a prompt.',
        'Cap applications per day, tool calls per cycle and spend per week. When a ceiling is hit, stop and tell the user rather than degrading silently — a stopped agent is a recoverable situation, a silently wrong one is not.',
        'Loop detection deserves its own limit. An agent that retries the same failing action forty times in a cycle is not making progress, and a simple per-cycle cap on repeated attempts against the same target catches a class of runaway that spend limits only catch after the money is gone.',
      ],
    },
    {
      heading: 'Observability over weeks, not over a request',
      paragraphs: [
        'Debugging a long-running agent means answering what it did on a Tuesday eleven days ago, which is a different problem from tracing one request. The trace has to be queryable by candidate, by posting and by day, or it is unusable when it matters.',
        'Record the decision, not just the action. Knowing that a posting was skipped is much less useful than knowing it was skipped because the salary floor rejected it — and the second is what lets a candidate notice that their floor is set wrong.',
        'Surface a periodic digest to the user as well. An agent working quietly for a fortnight accumulates decisions nobody has reviewed, and a short weekly summary is what keeps a small misconfiguration from becoming a fortnight of wasted applications.',
      ],
      bullets: [
        'Traces queryable by candidate, posting and date',
        'Decisions and their reasons, not only outcomes',
        'A weekly digest the candidate actually receives',
        'An alert when a ceiling is hit, not a silent stop',
        'Retention that matches how long the search runs',
      ],
    },
    {
      heading: 'Define what done means',
      paragraphs: [
        'Long-running agents drift. Three weeks in, the criteria the user gave have quietly stopped matching what they want, and the agent is applying to roles they would now decline.',
        'Build in re-confirmation: a periodic check-in showing what has been done and asking whether to continue. And define real terminating conditions — an accepted offer, an expiry date, a spending cap — because an agent with no end state simply keeps going.',
        'Expiry by default is the most useful of these. An agent authorised for four weeks that stops and asks to be renewed cannot become the thing still applying on someone’s behalf months after they took a job, which is a failure mode that has no technical difficulty and considerable embarrassment attached.',
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
    {
      q: 'Should it be one long process or many short runs?',
      a: 'Many short runs over shared state. A cycle that loads state, does bounded work, writes and exits is far easier to deploy and restart than something that must stay alive for weeks.',
    },
    {
      q: 'Why should authorisation expire by default?',
      a: 'So the agent cannot still be applying on someone behalf months after they took a job. Renewal is a small friction; that failure is pure embarrassment.',
    },
  ],
  related: ['how-to-build-an-ai-job-search-agent-with-langgraph', 'how-to-give-an-ai-agent-memory', 'how-to-build-reliable-ai-agents'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-reliable-ai-agents',
  tint: 'sky',
  title: 'How to Build Reliable AI Agents for Job Applications',
  heading: 'Making agents reliable',
  description:
    'Why agents fail differently from ordinary software, the patterns that make them dependable — checkpointing, verification, bounded loops — and how to test them.',
  keywords: [
    'reliable ai agents',
    'ai agent reliability',
    'agent error handling',
    'agent checkpointing',
    'agent retry strategy',
    'production ai agents',
    'agent failure modes',
    'dependable ai automation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['reliable AI agents', 'verify outcomes'],
  excerpt:
    'Ordinary software fails by stopping. Agents fail by continuing, which is why the usual reliability toolkit does not catch them.',
  keyTakeaways: [
    'An error rate of zero is compatible with consistently doing the wrong thing.',
    'Separate "the step ran" from "the step achieved its goal", and check the world.',
    'Checkpoint so a failure is resumable, especially around anything with a side effect.',
    'Limits live in code, and what happens at the limit matters as much as the limit.',
    'Test trajectories, not outputs — the right answer via an unsafe path is still a failure.',
  ],
  sections: [
    {
      heading: 'The failure mode that matters',
      paragraphs: [
        'A conventional program with a bad input throws, and something notices. An agent with a bad input reasons about it, forms a plausible interpretation, and proceeds — producing a completed run with wrong results and no error anywhere.',
        'That is why agent reliability is not the same discipline as service reliability. Your error rate can be zero while the system is doing the wrong thing consistently, and nothing in a standard monitoring stack will tell you.',
        'Non-determinism compounds it. The same input can produce a different path on Tuesday, so a bug that appeared once may not reproduce, and "it worked when I tried it" is compatible with a genuine and recurring defect.',
      ],
    },
    {
      heading: 'Verify outcomes, not completion',
      paragraphs: [
        'The core practice is separating "the step ran" from "the step achieved its goal". Filling a form is not the same as the form accepting the values; clicking submit is not the same as an application existing.',
        'After every consequential action, check the world rather than trusting the return value. Read the form back and diff it against what you intended. Look for the confirmation page, not merely the absence of an exception. This single habit removes most silent failures.',
        'Verification is usually far cheaper than the action it checks. Reading a field back is a DOM operation rather than a model call, so the discipline costs a fraction of what it appears to and catches the entire category of actions a page accepted visually and ignored internally.',
      ],
    },
    {
      heading: 'Checkpoint so a failure is resumable',
      paragraphs: [
        'A long agent run that dies at step forty should not restart at step one — that wastes the tokens already spent and, worse, may repeat actions that had side effects.',
        'Persist state after each step: which job, which stage, what was produced. On restart, resume from the last checkpoint and reconcile anything in an ambiguous state. This matters most around submission, where repeating a step means a duplicate application.',
        'Record the attempt before making it rather than after. A row saying an application was started and never completed is a question for a human, and it is far better than the two automatic answers — retry and duplicate, or skip and lose.',
      ],
      bullets: [
        'Persist after every step with a side effect',
        'Record attempts before making them, not after',
        'Reconcile "attempted, outcome unknown" explicitly on restart',
        'Make every step idempotent so a replay is harmless',
      ],
      table: {
        caption: 'How agents fail, and what catches it',
        columns: ['Failure', 'What monitoring sees', 'What catches it'],
        rows: [
          ['Silently wrong result', 'Success', 'Outcome verification'],
          ['Half-completed action', 'Success', 'State read-back'],
          ['Duplicate on retry', 'Success, twice', 'Idempotency keys'],
          ['Stuck in a loop', 'Rising cost', 'Repeated-call detection'],
          ['Runaway spend', 'An invoice', 'A budget checked before the call'],
          ['Quiet regression', 'Nothing', 'A fixed scenario suite'],
        ],
      },
    },
    {
      heading: 'Bound everything',
      paragraphs: [
        'Limits belong in code, not in the prompt. Maximum steps, maximum tool calls, maximum spend, maximum duration — and detection of repeated identical calls, which means the agent is stuck rather than working.',
        'What happens at the limit matters as much as the limit. Stopping silently is its own failure; the agent should escalate with enough context that a human can see how far it got and decide what to do.',
        'Make the refusal informative to the agent as well. "Search budget exhausted — 20 of 20 used" tells it to conclude with what it has, where an unexplained error invites it to retry until something else intervenes.',
      ],
    },
    {
      heading: 'Retry the transient, escalate the rest',
      paragraphs: [
        'Distinguish failures that a retry can fix — a timeout, a rate limit, a transient network error — from ones it cannot. Retrying a form that rejected a value because the value is wrong just produces the same rejection at additional cost.',
        'Classify before retrying, cap the attempts, and escalate the rest to a human with the full context. An agent that retries indefinitely is the most expensive possible way to not solve a problem.',
        'Cap retries across the run and not only per step. Five steps each retrying three times is fifteen attempts, and a run that has burned that many is usually failing for a reason another attempt will not address.',
      ],
    },
    {
      heading: 'Observability an agent actually needs',
      paragraphs: [
        'A conventional trace records what happened. An agent trace has to record why, because the interesting question is almost never which function ran but what the model concluded before calling it.',
        'Log the decision alongside the action: what it was trying to achieve, what it observed, what it chose and what changed as a result. A log of tool calls without reasoning tells you the sequence and nothing about the mistake.',
        'Make traces queryable by candidate, posting and date rather than only by request. Debugging a long-running agent means answering what it did on a Tuesday eleven days ago, which is a different retrieval problem from tracing one request.',
        'Treat the traces as personal data. They contain CVs, application content and decisions about people, so the same retention limits and access controls apply as to the primary records rather than an indefinite archive nobody scoped.',
      ],
    },
    {
      heading: 'Test on trajectories, not outputs',
      paragraphs: [
        'Evaluating only the final answer misses agents that reached the right result through an unsafe or absurdly expensive path. Score the path too: steps taken, tools called, cost incurred, and whether anything irreversible happened that should not have.',
        'Build a fixed set of scenarios including the awkward ones — a form with an unexpected field, a posting removed mid-run, a source returning nothing — and run them on every change. Agents regress quietly, and this is the only thing that catches it.',
        'Run each scenario several times rather than once. Non-determinism means a single pass proves very little, and a step that succeeds four times in five is a flaky step you want to know about before a user finds it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why do AI agents fail differently from normal software?',
      a: 'Normal software stops on a bad input. An agent interprets it plausibly and continues, so you get a completed run with wrong results and no error — which standard monitoring will not surface.',
    },
    {
      q: 'What is the single most useful reliability practice?',
      a: 'Verifying outcomes rather than completion. Check the world after every consequential action — read the form back, look for the confirmation — instead of trusting that the step returned without throwing.',
    },
    {
      q: 'How should an agent handle a long run that crashes?',
      a: 'Resume from a checkpoint rather than restarting. Persist after every step with a side effect, record attempts before making them, and reconcile anything left in an unknown state.',
    },
    {
      q: 'How do you test an agent properly?',
      a: 'On trajectories, not just final answers — steps, tools, cost and whether anything irreversible happened. Run each scenario several times, since one pass proves little under non-determinism.',
    },
    {
      q: 'What should an agent trace contain?',
      a: 'The reasoning, not only the actions. What it was trying to achieve, what it observed, what it chose and what changed — queryable by candidate and date rather than by request.',
    },
    {
      q: 'Is verification expensive?',
      a: 'Much less than it sounds. Reading state back is usually a DOM or database operation rather than a model call, so the cost is a fraction of the action it checks.',
    },
  ],
  related: ['how-to-build-reliable-browser-automation', 'how-to-test-an-ai-browser-agent', 'how-to-build-a-long-running-ai-agent'],
};

export default post;

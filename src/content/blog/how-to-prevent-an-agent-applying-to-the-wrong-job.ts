import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-prevent-an-agent-applying-to-the-wrong-job',
  tint: 'rose',
  title: 'How to Prevent an AI Agent From Applying to the Wrong Job',
  heading: 'Stopping the wrong application',
  description:
    'The specific ways an agent applies to the wrong job — stale identity, duplicate postings, context drift — and the checks that catch each before submission.',
  keywords: [
    'ai agent wrong job application',
    'prevent duplicate applications',
    'agent safety job applications',
    'job identity verification agent',
    'agent context drift',
    'application guardrails',
    'ai agent mistakes jobs',
    'safe job automation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Security',
  anchors: ['wrong job application', 'context drift'],
  excerpt:
    'Agents rarely apply to a randomly wrong job. They apply to a job that was right an hour ago, or to one of several that looked identical.',
  keyTakeaways: [
    'The real failures are narrow and mundane, which is why general safeguards miss them.',
    'Re-fetch and fingerprint the posting immediately before submitting.',
    'Pass an explicit job id into the submission tool; never let it infer one.',
    'Bind tailored material to the posting it was made for.',
    'Fail closed on ambiguity, and halt the batch when several checks fail in a row.',
  ],
  sections: [
    {
      heading: 'The realistic failure modes',
      paragraphs: [
        'The imagined failure is an agent going haywire and applying to anything. The real ones are narrower and more mundane, which is what makes them easy to miss in testing and common in production.',
        'Each has a specific cause and a specific check. Guarding against "the agent might be wrong" in general produces vague safeguards that catch none of them.',
        'They also share a property worth noticing: every one is a state problem rather than a reasoning problem. The model is not confused about what a job is — the system lost track of which one, and no amount of better prompting addresses that.',
      ],
      bullets: [
        'Stale identity — the posting was taken down or changed after scoring',
        'Duplicate confusion — applying to the same role twice via two sources',
        'Context drift — a long run where the active job silently changed',
        'Wrong candidate — the profile and the job belong to different people',
        'Mismatched material — a CV tailored for a different posting attached',
      ],
      table: {
        caption: 'Failure, cause, and the check that catches it',
        columns: ['Failure', 'Cause', 'Check'],
        rows: [
          ['Applied to a withdrawn role', 'Hours between scoring and sending', 'Re-fetch and fingerprint'],
          ['Applied twice to one role', 'Duplicates across sources', 'Idempotency on employer plus role'],
          ['Applied to a different job', 'Job inferred from context', 'Explicit id parameter'],
          ['Wrong CV attached', 'Queue reorder or retry', 'Material tagged with the job id'],
          ['Wrong candidate entirely', 'Session or scoping bug', 'Scoping enforced in the data layer'],
          ['Eighty bad submissions', 'One shared root cause', 'Batch circuit breaker'],
        ],
      },
    },
    {
      heading: 'Re-verify identity at submission',
      paragraphs: [
        'Scoring happens when a posting is ingested; submission may happen hours later. In between the role can be filled, edited, or withdrawn — and applying to a withdrawn posting is at best wasted and at worst submitted into a system that reopens later with different terms.',
        'Re-fetch the posting immediately before submitting and compare a fingerprint of the key fields against what was scored. If the title, company or requirements have changed materially, stop and re-score rather than proceeding with a decision made about a different job.',
        'Verify on the page as well as through the feed. Reading the title and employer from the application page the agent is actually on catches the case where a link redirected somewhere else, which a re-fetch of the original record cannot detect.',
      ],
    },
    {
      heading: 'Carry the job id, never infer it',
      paragraphs: [
        'Context drift is the failure specific to agent architectures. In a long run, the job under discussion is often inferred from conversation history or from whatever was most recently mentioned — and that inference can be wrong, or manipulated by content the agent read.',
        'The fix is structural: the submission step takes an explicit job identifier as a parameter, resolved once and passed through. Never let the tool that submits work out for itself which job is meant. This removes an entire class of failure rather than reducing its probability.',
        'The same applies to the candidate. Resolve identity from the verified session rather than from anything the agent supplies, because an id the model can produce is an id the model can get wrong — and a mismatch there is a data breach rather than a bad application.',
      ],
    },
    {
      heading: 'Bind the material to the posting',
      paragraphs: [
        'When a CV is tailored for a specific role, tag it with that job’s id. At submission, assert that the attached material was generated for the job being applied to.',
        'Without this, a retry or a queue reorder can attach the wrong tailored document — which is worse than a generic CV, because it is visibly written for somebody else’s posting.',
        'Extend the assertion to the free-text answers, which are the more embarrassing half. A cover note naming a different company is immediately obvious to the reader, and it is exactly the artefact most likely to survive a reorder because it was generated separately.',
      ],
    },
    {
      heading: 'Deduplicate before the queue, not after',
      paragraphs: [
        'The same role reaches you through four sources with four URLs, and a system keying idempotency on the posting link produces four keys and four applications. The key has to come from candidate, employer and normalised role instead.',
        'Check it before the browser opens rather than after the submission returns. A crash between submitting and recording leaves an ambiguous state, and only a record written before the attempt lets you tell a duplicate from a first try.',
        'Cap per employer as well as per role. Six applications to six different roles at one company in an afternoon arrive in one recruiter’s queue and are read as a single unserious candidate rather than six chances, which no per-role check prevents.',
      ],
    },
    {
      heading: 'Fail closed, and stop the batch',
      paragraphs: [
        'Every check above should refuse on ambiguity rather than proceeding on a best guess. A skipped application costs nothing; a wrong one is permanent.',
        'Then add the batch-level guard: if several submissions in a row fail their checks, halt everything and alert. The same root cause usually affects every item, and the difference between discovering it at two and at eighty is entirely whether something stopped automatically.',
        'Give the user a stop too. Someone who notices something wrong should be able to halt everything in one action without contacting support, and that same control is what you will reach for during an incident.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How does an agent end up applying to the wrong job?',
      a: 'Usually not randomly. It applies to a posting that changed after scoring, to one of several duplicates, or to a job it inferred from conversation context rather than being told explicitly.',
    },
    {
      q: 'Why re-fetch the posting before submitting?',
      a: 'Because scoring and submission can be hours apart. Roles get filled, edited or withdrawn, and reading the title from the page catches redirects a record re-fetch cannot.',
    },
    {
      q: 'How do I stop context drift choosing the wrong job?',
      a: 'Pass an explicit job identifier into the submission tool rather than letting it infer one from history. That removes the failure class structurally instead of making it less likely.',
    },
    {
      q: 'What should happen when a check is ambiguous?',
      a: 'Refuse. A skipped application costs nothing and a wrong one is permanent. Add a batch-level circuit breaker too, since one root cause usually breaks every item the same way.',
    },
    {
      q: 'What should the idempotency key be derived from?',
      a: 'Candidate, employer and normalised role — never the posting URL, since the same job arrives through four sources with four links.',
    },
    {
      q: 'Is a per-role cap enough?',
      a: 'No. Six applications to six roles at one company in an afternoon land in one recruiter queue and read as one unserious candidate, which a per-role check never sees.',
    },
  ],
  related: ['how-to-build-an-ai-agent-with-human-approval', 'how-to-build-an-ai-auto-apply-tool', 'how-to-build-reliable-ai-agents'],
};

export default post;

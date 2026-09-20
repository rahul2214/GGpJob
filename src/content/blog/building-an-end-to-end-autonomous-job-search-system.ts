import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'building-an-end-to-end-autonomous-job-search-system',
  tint: 'violet',
  title: 'Building an End-to-End Autonomous Job Search System',
  heading: 'How autonomous can it actually be?',
  description:
    'What full autonomy would require, where it breaks down in practice, the degrees of autonomy worth targeting, and the controls that make any of it safe.',
  keywords: [
    'autonomous job search system',
    'full autonomy agent',
    'autonomy levels ai',
    'unsupervised agent risks',
    'agent control design',
    'autonomous application system',
    'agent oversight',
    'job search autonomy',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['autonomous job search', 'degrees of autonomy'],
  excerpt:
    'Full autonomy is achievable and undesirable. The interesting engineering is in choosing which decisions to keep.',
  keyTakeaways: [
    'Every component of full autonomy is buildable; the objection is consequence, not capability.',
    'Autonomy fails wherever the decision depends on information about a life the system cannot see.',
    'Think in levels per stage, not one setting for the whole system.',
    'Pre-approval is the useful middle: judgement applied once, enforced in code thereafter.',
    'Limits, suppression lists, logs, a stop and idempotency are code, never prompt instructions.',
  ],
  sections: [
    {
      heading: 'What full autonomy would mean',
      paragraphs: [
        'A genuinely autonomous system would decide what roles to pursue, write and send applications, respond to recruiters, schedule interviews and negotiate — all without review. Every piece of that is technically buildable today.',
        'The problem is not capability. It is that each of those decisions affects the candidate’s career and reputation in ways they cannot undo, on the basis of information the system does not have about their life.',
        'It is worth noticing that the stages differ enormously in how reversible they are. Searching is free to get wrong, generating a document costs a review, and sending a message to a recruiter at a company you might want to work for in three years is permanent. A single autonomy setting across all of them is the design error, not the autonomy itself.',
      ],
    },
    {
      heading: 'Where it breaks down',
      paragraphs: [
        'Autonomy fails at judgements requiring information outside the system. Whether a commute is tolerable, whether a company’s reputation matters to them, whether a lower salary is acceptable for a better role, whether they would work for someone they know.',
        'It also fails on accountability. An application misrepresenting someone is their problem to explain, and "the system wrote it" is not an answer in an interview room.',
        'The most awkward failure is the one nobody specified. Nothing in a profile says the candidate left their last company badly, or that their current employer must not find out they are looking, or that one particular founder is someone they will not work with — and a system optimising for coverage will walk directly into all three.',
      ],
      bullets: [
        'Preferences that were never articulated because nobody asked',
        'Personal context the system has no access to',
        'Anything the candidate must later defend in conversation',
        'Actions that cannot be undone once an employer has seen them',
      ],
    },
    {
      heading: 'Degrees of autonomy',
      paragraphs: [
        'Rather than a binary, think in levels: suggest only; act on reversible things; act within pre-approved boundaries; act freely with reporting. Different stages of a job search sit at different levels, and that is the design.',
        'Discovery and tracking can sit high. Document generation sits in the middle. Submission and any outbound communication sit low, with explicit approval, because those are what the employer sees.',
        'Levels should also move with evidence. A system whose judgements the candidate has agreed with forty times running has earned more latitude than one on its first day, and raising the level deliberately as trust accumulates is a better design than choosing a single setting at install time.',
      ],
      table: {
        caption: 'A workable level per stage',
        columns: ['Stage', 'Level', 'Why'],
        rows: [
          ['Finding and deduplicating roles', 'Act freely', 'Nothing leaves the system'],
          ['Scoring and shortlisting', 'Act freely, report', 'Reversible, and visible in the feed'],
          ['Generating documents', 'Act, then review', 'Cheap to fix before it is sent'],
          ['Submitting an application', 'Pre-approved only', 'Irreversible, carries their name'],
          ['Replying to a recruiter', 'Explicit approval', 'A conversation, not a form'],
          ['Negotiating an offer', 'Never', 'Consequence far exceeds the benefit'],
        ],
      },
    },
    {
      heading: 'Pre-approval is the useful middle ground',
      paragraphs: [
        'Approving every application individually does not scale; approving nothing is unsafe. Between them sits pre-approval: the candidate defines what the agent may do — these employers, this seniority range, up to this many per week, with these documents — and the agent acts within it.',
        'That makes the boundaries explicit and enforceable in code, and it means the candidate’s judgement is applied once rather than repeatedly. It is the design most likely to be both used and safe.',
        'The boundaries have to be checkable without a model, which is the constraint that shapes the whole feature. "Roles similar to the ones I liked" cannot be enforced; "salary at or above this figure, within these locations, excluding these employers, at most eight per week" can be checked by a function that returns a boolean, and that is what a guardrail has to be.',
      ],
    },
    {
      heading: 'Controls that are not optional',
      paragraphs: [
        'Any autonomous operation needs hard limits on volume and spend, a suppression list for employers to exclude, a complete log of what was done, an immediate stop, and idempotency so that a restart never duplicates an application.',
        'All of these live in code. None can be a prompt instruction, because an agent’s reasoning is exactly the thing they exist to bound.',
        'Idempotency is the one most often discovered late. A queue that retries a partially completed submission will submit twice, and the candidate finds out when the employer’s tracking system flags a duplicate — so the key should be derived from candidate plus employer plus role and checked before the browser opens, not after.',
      ],
      example: {
        title: 'The check that runs before every submission',
        paragraphs: [
          'Before the agent opens a browser, a plain function evaluates the pre-approval record: is this employer on the suppression list, is the salary above the stated floor, is the location within the allowed set, has the weekly cap been reached, and does an application already exist for this candidate and this role?',
          'Any failure stops the action and writes a line to the log explaining which condition failed. The model is not consulted, and cannot be persuaded, because nothing in the path reads its output.',
          'That function is perhaps forty lines. It is also the single component standing between a normal week and a hundred applications to a company the candidate specifically excluded, which is a good ratio of effort to protection.',
        ],
      },
    },
    {
      heading: 'The reasonable target',
      paragraphs: [
        'Autonomous on everything mechanical, pre-approved on everything that produces an application, and human on everything an employer reads or that determines what the candidate is aiming at.',
        'That leaves a system doing the overwhelming majority of the work while the candidate remains the author of their own job search — which is the outcome worth building, rather than the maximum autonomy the technology allows.',
        'It is also the version people keep using. Tools that act too freely get switched off after the first embarrassing incident, and a system trusted for six months delivers far more than one that was briefly more impressive.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is a fully autonomous job search system possible?',
      a: 'Technically yes. The objection is not capability but that each decision affects a career irreversibly, using information the system does not have about the person life.',
    },
    {
      q: 'Where does autonomy break down?',
      a: 'On judgements needing outside context — commute tolerance, company reputation, pay trade-offs — and on accountability, since "the system wrote it" is not an answer in an interview.',
    },
    {
      q: 'What is the practical middle ground?',
      a: 'Pre-approval: the candidate defines employers, seniority range, weekly volume and documents once, and the agent acts within enforceable boundaries.',
    },
    {
      q: 'Which controls are mandatory?',
      a: 'Hard volume and spend limits, an employer suppression list, a complete action log, an immediate stop, and idempotency — all in code, never as prompt instructions.',
    },
    {
      q: 'Why must pre-approval rules be checkable without a model?',
      a: 'Because a guardrail the model evaluates is not a guardrail. "Roles similar to ones I liked" cannot be enforced; a salary floor, a location set and a weekly cap return a boolean.',
    },
    {
      q: 'Should the autonomy level ever change?',
      a: 'Yes — raise it deliberately as the system earns agreement. Forty judgements the candidate accepted is evidence; a single setting chosen at install time is a guess.',
    },
  ],
  related: ['the-complete-architecture-of-an-ai-job-application-platform', 'how-to-build-an-ai-agent-with-human-approval', 'from-resume-to-interview-ai-job-agent'],
};

export default post;

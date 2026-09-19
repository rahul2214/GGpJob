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
  excerpt:
    'Full autonomy is achievable and undesirable. The interesting engineering is in choosing which decisions to keep.',
  sections: [
    {
      heading: 'What full autonomy would mean',
      paragraphs: [
        'A genuinely autonomous system would decide what roles to pursue, write and send applications, respond to recruiters, schedule interviews and negotiate — all without review. Every piece of that is technically buildable today.',
        'The problem is not capability. It is that each of those decisions affects the candidate’s career and reputation in ways they cannot undo, on the basis of information the system does not have about their life.',
      ],
    },
    {
      heading: 'Where it breaks down',
      paragraphs: [
        'Autonomy fails at judgements requiring information outside the system. Whether a commute is tolerable, whether a company’s reputation matters to them, whether a lower salary is acceptable for a better role, whether they would work for someone they know.',
        'It also fails on accountability. An application misrepresenting someone is their problem to explain, and "the system wrote it" is not an answer in an interview room.',
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
      ],
    },
    {
      heading: 'Pre-approval is the useful middle ground',
      paragraphs: [
        'Approving every application individually does not scale; approving nothing is unsafe. Between them sits pre-approval: the candidate defines what the agent may do — these employers, this seniority range, up to this many per week, with these documents — and the agent acts within it.',
        'That makes the boundaries explicit and enforceable in code, and it means the candidate’s judgement is applied once rather than repeatedly. It is the design most likely to be both used and safe.',
      ],
    },
    {
      heading: 'Controls that are not optional',
      paragraphs: [
        'Any autonomous operation needs hard limits on volume and spend, a suppression list for employers to exclude, a complete log of what was done, an immediate stop, and idempotency so that a restart never duplicates an application.',
        'All of these live in code. None can be a prompt instruction, because an agent’s reasoning is exactly the thing they exist to bound.',
      ],
    },
    {
      heading: 'The reasonable target',
      paragraphs: [
        'Autonomous on everything mechanical, pre-approved on everything that produces an application, and human on everything an employer reads or that determines what the candidate is aiming at.',
        'That leaves a system doing the overwhelming majority of the work while the candidate remains the author of their own job search — which is the outcome worth building, rather than the maximum autonomy the technology allows.',
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
  ],
  related: ['the-complete-architecture-of-an-ai-job-application-platform', 'how-to-build-an-ai-agent-with-human-approval', 'from-resume-to-interview-ai-job-agent'],
};

export default post;

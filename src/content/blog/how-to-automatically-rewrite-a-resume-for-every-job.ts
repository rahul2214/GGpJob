import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-automatically-rewrite-a-resume-for-every-job',
  tint: 'emerald',
  title: 'How to Automatically Rewrite a Resume for Every Job',
  heading: 'Per-job resume rewriting',
  description:
    'Building automatic tailoring that changes emphasis without changing facts: a structured source of truth, selection over generation, and verifying every claim.',
  keywords: [
    'automatic resume rewriting',
    'tailored resume generation',
    'resume per job',
    'structured resume data',
    'selection vs generation',
    'resume fact verification',
    'ai resume tailoring',
    'resume versioning',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Resumes & ATS',
  excerpt:
    'Tailoring should change what is emphasised, not what is true. The architecture is what enforces that, not the prompt.',
  sections: [
    {
      heading: 'Rewrite from structured data, not from the document',
      paragraphs: [
        'Handing a model a CV and a posting and asking for a tailored version is how facts drift. Each rewrite is a fresh interpretation of prose, and dates, titles and figures mutate slightly with every pass.',
        'Keep a structured source of truth — roles, dates, achievements with their metrics, skills with evidence — and generate documents from it. The facts then live in fields that do not change, and the model composes rather than reinterprets.',
      ],
    },
    {
      heading: 'Selection does most of the work',
      paragraphs: [
        'Good tailoring is mostly about what you leave out and what you lead with. The same career, ordered differently and trimmed differently, reads as a different candidate to two different employers — without a single altered fact.',
        'So the first pass is selection: which achievements are relevant to this posting, in what order, at what length. Only then does generation phrase the selected items. Teams that start with generation end up fighting hallucination they created themselves.',
      ],
      bullets: [
        'Score each achievement against the posting requirements',
        'Select and order by relevance, trim to a realistic length',
        'Generate phrasing only for the selected items',
        'Verify every generated line against the structured record',
      ],
    },
    {
      heading: 'Verify, do not trust',
      paragraphs: [
        'Even with structured input, generated text can invent a detail — a team size, a percentage, a technology that was not in the record. It will be plausible, which is precisely why it survives review.',
        'Run a verification pass that checks each claim against the source data and rejects anything unsupported. This is a machine-checkable property when the source is structured, and it is the difference between an automated document and a liability.',
      ],
    },
    {
      heading: 'Keep the person recognisable',
      paragraphs: [
        'A CV rewritten wholesale by a model reads like every other model-written CV: the same rhythms, the same verbs, the same shape. Recruiters reading hundreds of these have started to spot the pattern, and it reads as effort avoided rather than effort spent.',
        'Preserve the candidate’s phrasing where it works. Change emphasis, order and length; change the words only where the original genuinely obscures something relevant.',
      ],
    },
    {
      heading: 'Version and keep what was sent',
      paragraphs: [
        'Once documents are generated per application, each one differs, and the candidate will be interviewed against a specific version. Not knowing which is a real problem in a real conversation.',
        'Store the exact document sent with the application record, permanently. It is also what lets you improve — comparing which tailoring choices preceded responses is the only feedback this system will ever get.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why rewrite from structured data instead of the CV document?',
      a: 'Because each prose rewrite is a fresh interpretation, and dates, titles and figures drift with every pass. Structured fields hold the facts steady while the model composes.',
    },
    {
      q: 'What does good tailoring actually change?',
      a: 'Emphasis, order and length — not facts. The same career, selected and ordered differently, reads as a different candidate to two employers without a single altered claim.',
    },
    {
      q: 'How do I stop generated resumes inventing details?',
      a: 'Run a verification pass that checks every claim against the structured source and rejects the unsupported. With structured input this is machine-checkable, unlike a prompt asking for honesty.',
    },
    {
      q: 'Should I keep the generated versions?',
      a: 'Yes, stored with the application record. The candidate will be interviewed against one specific version, and comparing versions against responses is the only feedback the system gets.',
    },
  ],
  related: ['how-ai-can-create-job-specific-resume-versions', 'how-to-build-an-ai-resume-tailoring-system', 'how-to-reduce-hallucinations-in-ai-resume-generation'],
};

export default post;

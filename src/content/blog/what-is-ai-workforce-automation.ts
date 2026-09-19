import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-ai-workforce-automation',
  tint: 'sky',
  title: 'What Is AI Workforce Automation?',
  heading: 'AI workforce automation',
  description:
    'What organisations mean by AI workforce automation, which tasks actually get automated, why headcount rarely falls as predicted, and what it means for your role.',
  keywords: [
    'ai workforce automation',
    'workforce automation ai',
    'ai automation jobs impact',
    'task automation vs job automation',
    'ai and headcount',
    'enterprise ai automation',
    'ai changing work',
    'automation and employment',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI & Careers',
  excerpt:
    'Automation happens to tasks, not to jobs. That distinction explains nearly every gap between the forecasts and what actually occurred.',
  sections: [
    {
      heading: 'Tasks, not jobs',
      paragraphs: [
        'A job is a bundle of tasks. Automation removes tasks from the bundle, and the job changes shape rather than disappearing — unless the bundle happened to contain only one kind of task.',
        'This is why confident predictions about which jobs vanish keep missing. The roles most exposed are not the ones that sound most automatable; they are the ones whose bundle is narrowest, which is a different and much less obvious list.',
      ],
    },
    {
      heading: 'Which tasks actually go',
      paragraphs: [
        'The pattern is consistent across organisations. Tasks disappear when they are repetitive, have a checkable output, and carry a low cost of being occasionally wrong. Drafting routine correspondence, first-pass document review, summarising, categorising, extracting fields from unstructured text.',
        'Tasks survive when being wrong is expensive, when accountability must sit with a person, or when the work is fundamentally about persuading or negotiating with someone. Not because a model cannot attempt them, but because someone has to be answerable for the outcome.',
      ],
      bullets: [
        'Automated: drafting, summarising, classifying, extracting, first-pass review',
        'Retained: final judgement, accountability, negotiation, relationships',
        'Retained: anything where an error is expensive to discover late',
      ],
    },
    {
      heading: 'Why headcount rarely falls as forecast',
      paragraphs: [
        'The recurring surprise is that automating a task often increases the work rather than reducing the workforce. When drafting becomes cheap, more drafts get produced, and someone has to review them.',
        'Review is also slower and more senior work than production was. Organisations frequently end up with the same number of people doing a different and more demanding job, which is a real change and not the one that was projected.',
      ],
    },
    {
      heading: 'What it means for your own role',
      paragraphs: [
        'The useful exercise is to list your week honestly by task and mark which ones have a checkable output and a low cost of error. That is your exposure, stated concretely instead of as anxiety.',
        'Then look at what remains. If the residue is substantial — judgement, ownership, relationships — your job is changing rather than ending. If the residue is thin, that is worth knowing early, while there is time to widen the bundle deliberately.',
      ],
    },
    {
      heading: 'The honest uncertainty',
      paragraphs: [
        'Deployment is slower than capability, and always has been. Regulation, liability, integration with systems nobody wants to touch, and plain organisational inertia slow adoption far more than technical limits do.',
        'That argues for neither complacency nor panic. The strategies that pay off — deepening judgement, owning outcomes, building relationships — are the same ones that pay off if none of this arrives on schedule, which is what makes them worth choosing.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is AI workforce automation?',
      a: 'Using AI to take over tasks within jobs across an organisation. The unit that gets automated is the task, not the role — which is why predictions about disappearing jobs so often miss.',
    },
    {
      q: 'Which tasks get automated first?',
      a: 'Repetitive ones with a checkable output and a low cost of being occasionally wrong: drafting, summarising, classifying, extracting fields, first-pass review.',
    },
    {
      q: 'Why does headcount often not fall?',
      a: 'Because cheap production increases volume, and someone must review the output. Review is slower and more senior work, so organisations frequently end up with the same people doing a more demanding job.',
    },
    {
      q: 'How do I assess my own exposure?',
      a: 'List your week by task and mark the ones with a checkable output and a low cost of error. What remains is your actual position — and if that residue is thin, it is far better to know it early.',
    },
  ],
  related: ['will-ai-take-my-job', 'what-is-agentic-automation', 'ai-agents-vs-recruiters'],
};

export default post;

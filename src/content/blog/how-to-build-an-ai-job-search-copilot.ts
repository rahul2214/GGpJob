import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-search-copilot',
  tint: 'violet',
  title: 'How to Build an AI Job Search Copilot',
  heading: 'A copilot, not an autopilot',
  description:
    'Designing an assistant that works alongside the candidate: suggesting rather than acting, being available in context, and staying correctable throughout.',
  keywords: [
    'ai job search copilot',
    'copilot design pattern',
    'assistive ai ux',
    'suggestion not action',
    'in context assistance',
    'human in control',
    'job search assistant',
    'copilot vs agent',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'The copilot pattern trades autonomy for trust, and in a job search that is usually the right trade.',
  sections: [
    {
      heading: 'What the pattern means here',
      paragraphs: [
        'A copilot proposes and the person disposes. It drafts, suggests, highlights and explains, and every consequential action is taken by the candidate — who remains the author of their own application.',
        'The appeal in this domain is specific: applications carry someone’s name and reputation, and people are reasonably unwilling to hand that to a system they have known for a week.',
      ],
    },
    {
      heading: 'Be present where the work happens',
      paragraphs: [
        'A copilot in a separate chat window is a chatbot. The value comes from being available at the point of action: while reading a posting, while editing a CV section, while writing an answer to a form question.',
        'That means surfacing suggestions in context and accepting them in one action. A suggestion requiring the user to switch screens, copy text and come back has already cost more than it saved.',
      ],
      bullets: [
        'Suggest while the relevant thing is on screen',
        'Accept, edit or dismiss in a single action',
        'Explain the suggestion in one line, not a paragraph',
        'Never modify anything without an explicit accept',
      ],
    },
    {
      heading: 'Suggest less than you could',
      paragraphs: [
        'A copilot commenting on everything becomes noise, and noise is dismissed wholesale — including the suggestions that were worth taking.',
        'Set a confidence bar and stay quiet below it. Three good suggestions on a CV are acted on; fifteen are ignored, and the user learns to disregard the feature entirely.',
      ],
    },
    {
      heading: 'Make disagreement easy and informative',
      paragraphs: [
        'The user will reject suggestions, often correctly — they know things the system does not. Dismissal should be one action and should never be treated as a failure to be re-argued.',
        'Capture why, when it is cheap to ask. A dismissal reason is the highest-quality feedback signal in the product, far better than anything inferred from behaviour.',
      ],
    },
    {
      heading: 'Where the copilot should hand off',
      paragraphs: [
        'Some tasks are genuinely better automated: filling in twenty identical profile fields on a portal, checking whether a posting is still open, tracking which applications need follow-up. Insisting on suggestion for those is ceremony.',
        'The distinction that holds up is reversibility. Automate what can be undone; suggest what cannot. Submission, outbound messages and anything an employer sees stay with the person.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What makes a copilot different from an agent?',
      a: 'It proposes and the person disposes. Every consequential action is taken by the candidate, who remains the author of their own application.',
    },
    {
      q: 'Where should copilot suggestions appear?',
      a: 'At the point of action — while reading a posting or editing a section — acceptable in one action. A separate chat window makes it a chatbot.',
    },
    {
      q: 'How many suggestions should it make?',
      a: 'Few. Three good suggestions get acted on; fifteen get ignored along with the good ones, and the user learns to disregard the feature.',
    },
    {
      q: 'What should be automated rather than suggested?',
      a: 'Anything reversible — filling profile fields, checking whether a posting is open, tracking follow-ups. Submission and anything an employer sees stays with the person.',
    },
  ],
  related: ['ai-job-search-copilot-vs-application-agent', 'how-to-build-an-ai-career-assistant-for-job-seekers', 'how-to-build-an-ai-agent-with-human-approval'],
};

export default post;

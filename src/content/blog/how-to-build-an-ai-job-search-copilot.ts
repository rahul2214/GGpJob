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
  anchors: ['job search copilot pattern', 'suggest rather than act'],
  excerpt:
    'The copilot pattern trades autonomy for trust, and in a job search that is usually the right trade.',
  keyTakeaways: [
    'Every consequential action stays with the candidate, who remains the author of their application.',
    'A copilot in a separate chat window is a chatbot; the value is being present at the point of action.',
    'Three good suggestions get acted on; fifteen get ignored along with the good ones.',
    'Dismissal must be one action, and the reason is the best feedback the product will get.',
    'Automate what can be undone; suggest what cannot.',
  ],
  sections: [
    {
      heading: 'What the pattern means here',
      paragraphs: [
        'A copilot proposes and the person disposes. It drafts, suggests, highlights and explains, and every consequential action is taken by the candidate — who remains the author of their own application.',
        'The appeal in this domain is specific: applications carry someone’s name and reputation, and people are reasonably unwilling to hand that to a system they have known for a week.',
        'It is a spectrum rather than a category, and the useful question is per action. The same product can propose a cover letter, ask before submitting it, and quietly send a scheduled follow-up — three different positions inside one workflow, each defensible for its own reasons.',
      ],
    },
    {
      heading: 'Be present where the work happens',
      paragraphs: [
        'A copilot in a separate chat window is a chatbot. The value comes from being available at the point of action: while reading a posting, while editing a CV section, while writing an answer to a form question.',
        'That means surfacing suggestions in context and accepting them in one action. A suggestion requiring the user to switch screens, copy text and come back has already cost more than it saved.',
        'Latency is part of being present. A suggestion that arrives three seconds after the user has moved on is a suggestion about the previous task, so streaming something useful quickly beats producing something better late.',
      ],
      bullets: [
        'Suggest while the relevant thing is on screen',
        'Accept, edit or dismiss in a single action',
        'Explain the suggestion in one line, not a paragraph',
        'Never modify anything without an explicit accept',
      ],
      table: {
        caption: 'Which mode each action wants',
        columns: ['Action', 'Mode', 'Why'],
        rows: [
          ['Rewriting a CV bullet', 'Suggest', 'Taste, and the user knows more'],
          ['Answering "why this company"', 'Suggest', 'Only they have the answer'],
          ['Filling repeated profile fields', 'Automate', 'Known answer, nothing tested'],
          ['Checking a posting is still open', 'Automate', 'Pure monitoring'],
          ['Submitting an application', 'The person', 'Irreversible, carries their name'],
          ['Scheduling a follow-up reminder', 'Automate', 'Low stakes, high forgetting rate'],
        ],
      },
    },
    {
      heading: 'Suggest less than you could',
      paragraphs: [
        'A copilot commenting on everything becomes noise, and noise is dismissed wholesale — including the suggestions that were worth taking.',
        'Set a confidence bar and stay quiet below it. Three good suggestions on a CV are acted on; fifteen are ignored, and the user learns to disregard the feature entirely.',
        'Order by how much each would change the outcome rather than by where it appears in the document. The one suggestion that matters should be first, because attention falls off sharply and the third item is read differently from the first.',
      ],
    },
    {
      heading: 'The failure mode a copilot has and an agent does not',
      paragraphs: [
        'Presented with a fluent draft, most people edit rather than reconsider. The suggestion becomes the starting point, and a copilot with one house style produces a hundred applications that sound the same despite each having been individually approved.',
        'Offer variety where it is cheap — two distinct framings rather than one polished paragraph — and preserve the candidate’s own phrasing wherever it works. A slightly awkward sentence in their voice is worth more than a smooth one in the model’s.',
        'Watch for approval becoming reflexive as well. A user accepting every suggestion is not being helped by the review step, and that is measurable: an acceptance rate near a hundred per cent means the bar is set too low rather than that the suggestions are excellent.',
      ],
    },
    {
      heading: 'Make disagreement easy and informative',
      paragraphs: [
        'The user will reject suggestions, often correctly — they know things the system does not. Dismissal should be one action and should never be treated as a failure to be re-argued.',
        'Capture why, when it is cheap to ask. A dismissal reason is the highest-quality feedback signal in the product, far better than anything inferred from behaviour.',
        'Offer the reasons rather than asking for them. A free-text box is answered by almost nobody; three tappable options covering the common cases are answered by most people and produce something you can act on directly.',
      ],
    },
    {
      heading: 'Where the copilot should hand off',
      paragraphs: [
        'Some tasks are genuinely better automated: filling in twenty identical profile fields on a portal, checking whether a posting is still open, tracking which applications need follow-up. Insisting on suggestion for those is ceremony.',
        'The distinction that holds up is reversibility. Automate what can be undone; suggest what cannot. Submission, outbound messages and anything an employer sees stay with the person.',
        'The second test is whether review would catch anything. If a user reviewing the output would reliably spot a mistake, the suggestion adds safety; if they would skim and approve — as everyone does by the fortieth identical form — the review is theatre and automating honestly is better.',
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
      a: 'Few, ordered by impact. Three good suggestions get acted on; fifteen get ignored along with the good ones.',
    },
    {
      q: 'What should be automated rather than suggested?',
      a: 'Anything reversible — filling profile fields, checking whether a posting is open, tracking follow-ups. Submission and anything an employer sees stays with the person.',
    },
    {
      q: 'What is the hidden weakness of a copilot?',
      a: 'Anchoring. People edit a fluent draft rather than reconsidering it, so one house style produces a hundred applications that sound identical despite each being approved.',
    },
    {
      q: 'How do I tell whether the review step is real?',
      a: 'Measure the acceptance rate. Near a hundred per cent means the confidence bar is too low, not that the suggestions are excellent.',
    },
  ],
  related: ['ai-job-search-copilot-vs-application-agent', 'how-to-build-an-ai-career-assistant-for-job-seekers', 'how-to-build-an-ai-agent-with-human-approval'],
};

export default post;

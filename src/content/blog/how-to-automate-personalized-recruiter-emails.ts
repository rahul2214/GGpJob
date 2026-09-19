import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-automate-personalized-recruiter-emails',
  tint: 'amber',
  title: 'How to Automate Personalized Recruiter Emails With AI',
  heading: 'Automating a message worth reading',
  description:
    'Generating recruiter emails that get replies: structure, length, what to reference, verifying every claim, and the review step you should not remove.',
  keywords: [
    'personalised recruiter email',
    'automate outreach emails',
    'cold email structure',
    'email generation ai',
    'reply rate outreach',
    'email quality gate',
    'recruiter email template',
    'job search email',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Recruiters decide in about four seconds. Almost everything a generated email wants to say is spent after that decision is made.',
  sections: [
    {
      heading: 'Write for a four-second decision',
      paragraphs: [
        'A recruiter scanning an inbox gives each message a glance. In that time they establish who this is, what they want, and whether it is relevant. Everything else is read only if those three land.',
        'So the structure is fixed by the constraint: who, what, why relevant — in the first two lines. Generated emails that open with a paragraph of admiration for the company have spent the entire budget before saying anything.',
      ],
      bullets: [
        'Subject that states the role and the point',
        'First line: who you are and which role',
        'Second line: the single strongest relevant fact',
        'One short paragraph of specifics',
        'A clear, small ask',
      ],
    },
    {
      heading: 'Length is a quality signal',
      paragraphs: [
        'Models produce long text by default, and long cold emails go unread. Six lines that say something specific outperform four paragraphs that say the same thing with more words.',
        'Enforce a hard cap in the generation step rather than asking for brevity. "Be concise" produces something slightly shorter than it would have been; a length limit produces something the recruiter reads.',
      ],
    },
    {
      heading: 'Reference the role, not the company’s marketing',
      paragraphs: [
        'Praise for a company’s mission adds nothing — they know their mission, and every applicant says it. Recent funding news is equally irrelevant to whether this candidate fits.',
        'The reference that works ties the candidate to the specific work: a requirement in the posting they have done, a problem the team has that they have solved before. One sentence of that beats three paragraphs of enthusiasm.',
      ],
    },
    {
      heading: 'Every factual claim must be verifiable',
      paragraphs: [
        'Generated outreach invents things — a project the candidate did not do, a number that was not in their record, a technology they have not used. In an email sent under the candidate’s name to someone who may interview them, that is a serious problem.',
        'Constrain generation to the structured profile and validate each claim against it before sending. A claim with no supporting record is rejected, not softened.',
      ],
    },
    {
      heading: 'Keep the human in the loop',
      paragraphs: [
        'It is tempting to remove review once quality seems consistent. Resist it: these messages go out under a real person’s name to people who may hire them, and the failure is not recoverable.',
        'Make review fast rather than optional — batch the drafts, show them in a list, allow edit-and-send in a couple of actions. The cost is seconds per message; the thing it protects is the candidate’s professional reputation.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How long should an automated recruiter email be?',
      a: 'Short enough to read in a glance — around six lines. Enforce a hard cap in generation rather than asking for brevity, which only shortens slightly.',
    },
    {
      q: 'What should the first two lines say?',
      a: 'Who you are, which role, and the single strongest relevant fact. Opening with admiration for the company spends the recruiter attention before saying anything.',
    },
    {
      q: 'How do I stop generated emails inventing claims?',
      a: 'Constrain generation to the structured profile and validate each claim against it. Anything without a supporting record is rejected, not softened.',
    },
    {
      q: 'Can I remove the human review step?',
      a: 'You should not. These go out under a real name to people who may hire the sender, and the failure is unrecoverable. Make review fast instead of optional.',
    },
  ],
  related: ['how-to-build-an-ai-cold-email-agent', 'how-to-build-an-ai-recruiter-outreach-agent', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;

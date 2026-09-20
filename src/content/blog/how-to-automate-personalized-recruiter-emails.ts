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
  anchors: ['recruiter emails', 'cold email'],
  excerpt:
    'Recruiters decide in about four seconds. Almost everything a generated email wants to say is spent after that decision is made.',
  keyTakeaways: [
    'Who, what, why relevant — in the first two lines, because that is all the attention you get.',
    'Enforce a length cap in code; asking a model for brevity produces slightly less verbosity.',
    'Reference the work, not the company’s marketing. They already know their mission.',
    'Every factual claim validates against the structured profile or it does not go out.',
    'Make review fast rather than optional — the failure is unrecoverable and public.',
  ],
  sections: [
    {
      heading: 'Write for a four-second decision',
      paragraphs: [
        'A recruiter scanning an inbox gives each message a glance. In that time they establish who this is, what they want, and whether it is relevant. Everything else is read only if those three land.',
        'So the structure is fixed by the constraint: who, what, why relevant — in the first two lines. Generated emails that open with a paragraph of admiration for the company have spent the entire budget before saying anything.',
        'The subject line is doing more work than the body in that first moment, and it should be plain rather than clever. Naming the role and the one relevant fact gets opened; anything that reads as a marketing subject gets the treatment marketing subjects get.',
      ],
      bullets: [
        'Subject that states the role and the point',
        'First line: who you are and which role',
        'Second line: the single strongest relevant fact',
        'One short paragraph of specifics',
        'A clear, small ask',
      ],
      table: {
        caption: 'Where the attention goes',
        columns: ['Element', 'Attention it gets', 'What it must do'],
        rows: [
          ['Subject', 'Always read', 'Name the role and the point'],
          ['First line', 'Almost always', 'Who, and which role'],
          ['Second line', 'Usually', 'The strongest relevant fact'],
          ['Middle paragraph', 'Only if the above landed', 'One specific, verifiable detail'],
          ['The ask', 'Read if they got there', 'Small, clear, easy to decline'],
          ['Signature block', 'Scanned', 'A link worth clicking'],
        ],
      },
    },
    {
      heading: 'Length is a quality signal',
      paragraphs: [
        'Models produce long text by default, and long cold emails go unread. Six lines that say something specific outperform four paragraphs that say the same thing with more words.',
        'Enforce a hard cap in the generation step rather than asking for brevity. "Be concise" produces something slightly shorter than it would have been; a length limit produces something the recruiter reads.',
        'Enforce it after generation as well as before. Generate, count, and regenerate if it is over — a check in code is the only version that actually holds, because an instruction in the prompt competes with everything else the model is trying to do.',
      ],
    },
    {
      heading: 'Reference the role, not the company’s marketing',
      paragraphs: [
        'Praise for a company’s mission adds nothing — they know their mission, and every applicant says it. Recent funding news is equally irrelevant to whether this candidate fits.',
        'The reference that works ties the candidate to the specific work: a requirement in the posting they have done, a problem the team has that they have solved before. One sentence of that beats three paragraphs of enthusiasm.',
        'It has to be checkable, too. Something the recipient could verify in ten seconds — a repository, a shipped feature, a talk — does work that no amount of assertion does, because the claim carries its own evidence.',
      ],
    },
    {
      heading: 'Every factual claim must be verifiable',
      paragraphs: [
        'Generated outreach invents things — a project the candidate did not do, a number that was not in their record, a technology they have not used. In an email sent under the candidate’s name to someone who may interview them, that is a serious problem.',
        'Constrain generation to the structured profile and validate each claim against it before sending. A claim with no supporting record is rejected, not softened.',
        'Outreach is a harder case than an application for this, and it is worth saying why. An application is one document among hundreds and a wrong claim may never be examined; an email opens a conversation, and the first thing a reply does is ask about the interesting claim in it.',
      ],
    },
    {
      heading: 'Finding the right person to write to',
      paragraphs: [
        'A perfect message to the wrong person achieves nothing, and this is where most automated outreach actually fails. A generic careers address is a worse target than the hiring manager, who is a worse target than someone who would work alongside the candidate.',
        'Guessing an address from a name pattern is the specific practice to avoid. It produces bounces at best and delivers to an uninvolved colleague at worst, and neither outcome is visible to a system that measured only whether the send succeeded.',
        'Verify before sending: confirm the address resolves, confirm the person is at the company now rather than two years ago, and check they are not already in the suppression list from an earlier contact. All three are cheap and all three are routinely skipped.',
      ],
      bullets: [
        'Prefer a named person over a role address',
        'Never construct an address from a naming pattern',
        'Confirm they are still there before writing',
        'Check the suppression list first, not after',
        'Record who was contacted, when, and about what',
      ],
    },
    {
      heading: 'Keep the human in the loop',
      paragraphs: [
        'It is tempting to remove review once quality seems consistent. Resist it: these messages go out under a real person’s name to people who may hire them, and the failure is not recoverable.',
        'Make review fast rather than optional — batch the drafts, show them in a list, allow edit-and-send in a couple of actions. The cost is seconds per message; the thing it protects is the candidate’s professional reputation.',
        'Watch for review becoming a formality, which is what happens when the queue is long and the drafts are consistently fine. Keeping daily volume low enough that each message genuinely gets read is what keeps the control real rather than nominal.',
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
    {
      q: 'How should the recipient be chosen?',
      a: 'A named person over a role address, verified as currently there, and checked against the suppression list. Never construct an address from a naming pattern.',
    },
    {
      q: 'Why is a wrong claim worse in outreach than in an application?',
      a: 'Because an email opens a conversation. An application may never be examined closely; a reply asks about the most interesting claim in the message.',
    },
  ],
  related: ['how-to-build-an-ai-cold-email-agent', 'how-to-build-an-ai-recruiter-outreach-agent', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;

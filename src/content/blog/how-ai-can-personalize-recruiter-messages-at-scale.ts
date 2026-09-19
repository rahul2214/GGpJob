import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-ai-can-personalize-recruiter-messages-at-scale',
  tint: 'amber',
  title: 'How AI Can Personalize Recruiter Messages at Scale',
  heading: 'Personalisation and scale, in tension',
  description:
    'Where personalisation genuinely scales and where it cannot, what recipients detect, and how to design a system that does not destroy its own channel.',
  keywords: [
    'personalisation at scale',
    'scaled outreach ai',
    'recruiter messaging',
    'template detection',
    'outreach channel decay',
    'message quality',
    'ai personalisation limits',
    'hiring outreach',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Scale and personalisation pull against each other by definition. The useful question is which parts of a message can scale and which cannot.',
  sections: [
    {
      heading: 'Split the message into scalable and unscalable parts',
      paragraphs: [
        'Not everything in a message needs to be unique. The structure, the framing, the ask — these can be consistent without anyone objecting. What must be genuinely specific is the connection: why this person, why this role, why now.',
        'Systems that try to make everything unique produce laboured text that reads oddly. Systems that make nothing unique produce templates. The working design makes one or two things genuinely specific and lets the rest be ordinary.',
      ],
      bullets: [
        'Scales fine — structure, tone, the closing ask',
        'Must be specific — the reason for contacting this person',
        'Must be true — every claim about the sender',
        'Should be omitted — generic praise and company facts',
      ],
    },
    {
      heading: 'Recipients detect it, and they are getting better at it',
      paragraphs: [
        'People who receive many messages recognise the patterns: an opening compliment, a paragraph of generically relevant experience, a closing ask for fifteen minutes. The tells are structural more than lexical, which is why rewording does not help.',
        'And once detected, the message is not merely ignored — it is evidence that the sender did nothing, which is a worse outcome than not sending. The presence of a personalised-sounding message that is obviously not personalised is a negative signal.',
      ],
    },
    {
      heading: 'Volume caps are a quality mechanism',
      paragraphs: [
        'Genuine specificity requires genuine input, and there is only so much a candidate can truthfully say they care about. Beyond a modest number of contacts a week, the system is manufacturing interest that does not exist.',
        'So capping volume is not a limitation on the product — it is the thing that keeps the output honest. The cap should be low enough that every message can survive the test of being read aloud to the recipient.',
      ],
    },
    {
      heading: 'The channel is a shared, depleting resource',
      paragraphs: [
        'Cold outreach works to the extent that recipients still read cold messages. Every low-quality automated message reduces that slightly, for everyone, including the person who sent it next time.',
        'A platform that enables high-volume outreach is spending a resource its users share. Designing for restraint is self-interested rather than altruistic: the channel’s effectiveness is the product.',
      ],
    },
    {
      heading: 'Let the system decline to send',
      paragraphs: [
        'The important capability is refusal. When there is nothing specific to say, the honest output is no message, and a generative system will never reach that conclusion on its own — it always produces something.',
        'Build the check explicitly: if the generated message contains no concrete, verifiable connection to this recipient, it does not send. That single rule does more for reply rates than any amount of prompt tuning.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can personalisation really scale?',
      a: 'Partly. Structure, tone and the ask can be consistent. The reason for contacting this specific person cannot be templated, and that is the part recipients check.',
    },
    {
      q: 'How do recipients spot automated messages?',
      a: 'Structurally — an opening compliment, generically relevant experience, a closing ask for fifteen minutes. Because the tells are structural, rewording does not hide them.',
    },
    {
      q: 'Why cap outreach volume?',
      a: 'Because genuine specificity needs genuine input, and beyond a modest weekly number the system is manufacturing interest that does not exist. The cap keeps output honest.',
    },
    {
      q: 'What is the single most effective rule?',
      a: 'Refusal. If the generated message has no concrete verifiable connection to the recipient, do not send it. That does more for reply rates than any prompt tuning.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'can-ai-personalize-100-job-applications', 'how-to-build-an-ai-job-application-personalization-engine'],
};

export default post;

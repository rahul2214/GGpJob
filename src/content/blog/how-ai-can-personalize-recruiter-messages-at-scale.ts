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
  anchors: ['recruiter messages', 'scaled outreach'],
  excerpt:
    'Scale and personalisation pull against each other by definition. The useful question is which parts of a message can scale and which cannot.',
  keyTakeaways: [
    'Structure and tone scale; the reason for contacting this specific person does not.',
    'The tells recipients use are structural, which is why rewording never helps.',
    'A message that sounds personalised and clearly is not is worse than no message.',
    'A volume cap is a quality mechanism, not a product limitation.',
    'The highest-value capability is refusal: no concrete connection, no send.',
  ],
  sections: [
    {
      heading: 'Split the message into scalable and unscalable parts',
      paragraphs: [
        'Not everything in a message needs to be unique. The structure, the framing, the ask — these can be consistent without anyone objecting. What must be genuinely specific is the connection: why this person, why this role, why now.',
        'Systems that try to make everything unique produce laboured text that reads oddly. Systems that make nothing unique produce templates. The working design makes one or two things genuinely specific and lets the rest be ordinary.',
        'One accurate specific sentence is enough. A message that is otherwise plainly structured but contains something that could only have been written about this recipient reads as a real person being efficient, which is exactly the impression you want.',
      ],
      bullets: [
        'Scales fine — structure, tone, the closing ask',
        'Must be specific — the reason for contacting this person',
        'Must be true — every claim about the sender',
        'Should be omitted — generic praise and company facts',
      ],
      table: {
        caption: 'What each part of the message costs to produce',
        columns: ['Part', 'Scales', 'Source'],
        rows: [
          ['Opening line', 'No', 'Something real about this person'],
          ['Why you are writing', 'Partly', 'The role, stated plainly'],
          ['Your relevant background', 'Yes', 'The structured profile'],
          ['Generic company praise', 'Omit it', 'Nothing — it is noise'],
          ['The ask', 'Yes', 'A fixed, modest request'],
        ],
      },
    },
    {
      heading: 'Recipients detect it, and they are getting better at it',
      paragraphs: [
        'People who receive many messages recognise the patterns: an opening compliment, a paragraph of generically relevant experience, a closing ask for fifteen minutes. The tells are structural more than lexical, which is why rewording does not help.',
        'And once detected, the message is not merely ignored — it is evidence that the sender did nothing, which is a worse outcome than not sending. The presence of a personalised-sounding message that is obviously not personalised is a negative signal.',
        'The specific tell most people name first is a compliment with no content behind it. Admiring someone’s "impressive work in the space" demonstrates that the sender did not look at the work, and it is more damaging than an opening that simply states the reason for writing.',
      ],
    },
    {
      heading: 'Volume caps are a quality mechanism',
      paragraphs: [
        'Genuine specificity requires genuine input, and there is only so much a candidate can truthfully say they care about. Beyond a modest number of contacts a week, the system is manufacturing interest that does not exist.',
        'So capping volume is not a limitation on the product — it is the thing that keeps the output honest. The cap should be low enough that every message can survive the test of being read aloud to the recipient.',
        'Reply rate per message is also the wrong thing to optimise if it is measured in isolation. The number that matters is conversations started per week, and a system sending five good messages that produce two conversations is beating one sending two hundred that produce one.',
      ],
    },
    {
      heading: 'The channel is a shared, depleting resource',
      paragraphs: [
        'Cold outreach works to the extent that recipients still read cold messages. Every low-quality automated message reduces that slightly, for everyone, including the person who sent it next time.',
        'A platform that enables high-volume outreach is spending a resource its users share. Designing for restraint is self-interested rather than altruistic: the channel’s effectiveness is the product.',
        'The depletion is already visible. Response rates to cold professional messages have fallen steadily as automated sending became easy, and every participant who scaled up contributed to the decline that now makes their own messages less effective.',
      ],
    },
    {
      heading: 'What a system needs before it sends anything',
      paragraphs: [
        'The specificity has to come from somewhere checkable. A pipeline that gathers something concrete about the recipient first — a public piece of work, a talk, a repository, a role change, a post they wrote — and passes only that to generation is doing the thing properly.',
        'Everything about the sender must trace to their profile. A message claiming experience the candidate does not have is worse in outreach than in an application, because it is the opening line of a relationship rather than one document among hundreds.',
        'And there must be a suppression list. People who asked not to be contacted, anyone already in a live process, anyone contacted in the last quarter, and any employer the candidate excluded all belong in a check that runs before generation rather than after.',
      ],
      bullets: [
        'One verifiable, concrete fact about the recipient',
        'Every sender claim traceable to the structured profile',
        'A suppression list checked before generating, not after',
        'A hard weekly cap, enforced in code',
        'A record of what was sent to whom and when',
      ],
    },
    {
      heading: 'Let the system decline to send',
      paragraphs: [
        'The important capability is refusal. When there is nothing specific to say, the honest output is no message, and a generative system will never reach that conclusion on its own — it always produces something.',
        'Build the check explicitly: if the generated message contains no concrete, verifiable connection to this recipient, it does not send. That single rule does more for reply rates than any amount of prompt tuning.',
        'Implement it outside the model, as a function over the gathered facts rather than as an instruction. A model asked to judge whether its own output is specific enough will say yes, which is the same reason every other guardrail belongs in code.',
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
    {
      q: 'Why must the refusal check live outside the model?',
      a: 'Because a model asked whether its own output is specific enough will say yes. It has to be a function over the gathered facts, like every other real guardrail.',
    },
    {
      q: 'What should be measured instead of reply rate?',
      a: 'Conversations started per week. Five good messages producing two conversations beat two hundred producing one, and only the second metric shows that.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'can-ai-personalize-100-job-applications', 'how-to-build-an-ai-job-application-personalization-engine'],
};

export default post;

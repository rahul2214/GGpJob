import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-cold-email-agent',
  tint: 'amber',
  title: 'How to Build an AI Cold Email Agent for Job Search',
  heading: 'A cold email agent, built carefully',
  description:
    'The sending infrastructure, consent and suppression handling, follow-up rules, reputation protection, and the regulations that apply to automated outreach.',
  keywords: [
    'cold email agent',
    'automated job search email',
    'email sending infrastructure',
    'suppression list',
    'follow up sequence',
    'sender reputation',
    'can-spam gdpr outreach',
    'outreach automation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['cold email agent', 'suppression list'],
  excerpt:
    'Generating the message is the easy tenth of this. The other nine tenths is sending infrastructure and the rules you enforce on yourself.',
  keyTakeaways: [
    'Build to the strictest regime you might face; retrofitting consent handling is far harder.',
    'One global suppression list, checked in the send path, permanent, no exceptions.',
    'Reputation is shared and degrades fast — authenticate, warm up, monitor, stop automatically.',
    'One follow-up. Sales cadences become harassment in a job search context.',
    'Measure reply rate, not sends; a falling rate at rising volume means stop.',
  ],
  sections: [
    {
      heading: 'Know which rules apply to you',
      paragraphs: [
        'Automated email is regulated, and differently by jurisdiction. Several regimes require a clear sender identity, an accurate subject line, a working opt-out and prompt honouring of it. Others require a lawful basis for processing the recipient’s data at all, and impose penalties that are not nominal.',
        'You will not know which apply from the recipient’s address alone, so build to the strictest requirements you are likely to face. Retrofitting consent handling onto a running system is considerably harder than designing for it.',
        'A domain suffix is not a jurisdiction, which is the specific trap. A recipient at a company with a global domain may sit anywhere, so any design that applies different rules based on the address is applying the wrong ones some of the time.',
      ],
    },
    {
      heading: 'Suppression is the most important data structure',
      paragraphs: [
        'One list, checked before every send, that nothing bypasses. Anyone who opted out, anyone who complained, anyone who bounced repeatedly, and any domain that has asked not to be contacted.',
        'It must be global rather than per user. If one candidate’s agent is told to stop and another’s contacts the same person next week, you have not honoured the opt-out — you have merely rotated who violated it.',
        'Recognise the informal opt-out too. "Please stop", a reply asking where you got the address, and a complaint-marked bounce are all objections, and a system that only honours a formal unsubscribe link will keep sending to someone who has clearly asked it not to.',
        'Check it before composing as well as before sending. Generating a message for a suppressed recipient costs tokens, produces something that must never be sent, and creates an artefact that only has to leak once through a bug to become a real violation.',
      ],
      bullets: [
        'Global across all users of the platform',
        'Checked in the send path, not the composition path',
        'Permanent, with no expiry or re-permission flow',
        'Including hard bounces and complaint reports',
        'Recognising informal objections, not just unsubscribe clicks',
      ],
    },
    {
      heading: 'Protect the sending reputation',
      paragraphs: [
        'Reputation is a shared asset and it degrades fast. Authenticate the domain properly, start at low volume and increase gradually, and keep message content varied enough that it does not fingerprint as bulk.',
        'Monitor bounce and complaint rates continuously with automatic stops at defined thresholds. Once mail from your domain is being filtered, recovery takes weeks and affects every user, including the careful ones.',
        'Verify addresses before sending rather than discovering them through bounces. A guessed address that bounces costs reputation that everyone on the platform shares, which is why pattern-generated addresses are a sending problem as well as a privacy one.',
        'Separate your sending domains by purpose. Transactional mail that users actually want should not share reputation with cold outreach, because one bad week on the second will start filtering the first — including password resets.',
      ],
      table: {
        caption: 'What to monitor, and what to do',
        columns: ['Signal', 'Threshold', 'Action'],
        rows: [
          ['Hard bounce rate', 'Low single digits', 'Stop and investigate verification'],
          ['Complaint rate', 'A fraction of a per cent', 'Stop immediately'],
          ['Reply rate falling', 'Any sustained decline', 'Reduce volume, not increase'],
          ['Sends per user per week', 'A low fixed cap', 'Refuse further sends'],
          ['Repeat contact of one person', 'One follow-up', 'Suppress further attempts'],
        ],
      },
    },
    {
      heading: 'Follow up once, maybe',
      paragraphs: [
        'Sales cadences of five or six touches are inappropriate here. This is one person asking another about a job, and the fifth unanswered message is harassment rather than persistence.',
        'One follow-up after a reasonable interval is defensible. After that, silence is an answer. Enforce it in code, because an agent optimising for replies will always argue for one more attempt.',
        'The follow-up should be shorter than the original and add something rather than repeat it. A second message restating the first is a reminder that the first was ignored, which is not an argument for reading this one.',
      ],
    },
    {
      heading: 'Send as the candidate, honestly',
      paragraphs: [
        'The message goes out under a real person’s name. It must accurately identify them, and it must not create the impression of a human individually composing each one if that is not what happened.',
        'Where a recipient could reasonably reply expecting a person, a person must receive that reply. An agent that sends but does not deliver responses back to the candidate promptly has manufactured a conversation nobody is having.',
        'Sending from the candidate’s own address is better for them and harder for you, and it is usually the right choice anyway. It arrives as a person writing rather than a platform, replies reach them directly, and the reputation consequences land where the behaviour is rather than on a shared domain.',
      ],
    },
    {
      heading: 'Volume is the wrong lever',
      paragraphs: [
        'Cold outreach in a job search works because the sender has something specific to say to a specific person. Multiply it and both halves of that disappear, while the metrics — messages sent — improve.',
        'Cap it low, and measure reply rate rather than send count. A falling reply rate at rising volume means the system is burning a shared resource, and the correct response is to slow down rather than to send more.',
        'The number worth optimising is conversations started per week. Five messages producing two conversations beat two hundred producing one, and only that metric makes the difference visible rather than flattering the wrong system.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What regulations apply to automated job search emails?',
      a: 'Several regimes require a clear sender identity, an accurate subject, a working opt-out and prompt honouring of it; others require a lawful basis for processing the recipient data. Build to the strictest.',
    },
    {
      q: 'How should a suppression list work?',
      a: 'One global list checked in the send path, permanent, covering opt-outs, complaints, hard bounces and informal objections. Per-user lists rotate who violates an opt-out.',
    },
    {
      q: 'How many follow-ups are appropriate?',
      a: 'One, after a reasonable interval, shorter than the original and adding something. Sales cadences of five or six touches become harassment in a job search context.',
    },
    {
      q: 'Should volume be increased if replies are low?',
      a: 'No. A falling reply rate at rising volume means the system is burning a shared resource. Measure conversations started, not sends, and slow down.',
    },
    {
      q: 'Should mail come from the candidate’s own address?',
      a: 'Usually yes. It arrives as a person rather than a platform, replies reach them directly, and reputation consequences land where the behaviour is.',
    },
    {
      q: 'Can I infer the applicable rules from the recipient’s domain?',
      a: 'No. A global domain says nothing about where the person is, so rules chosen by address suffix are the wrong rules some of the time.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'how-to-automate-personalized-recruiter-emails', 'how-to-build-an-ai-follow-up-agent'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-linkedin-outreach-assistant',
  tint: 'amber',
  title: 'How to Build an AI LinkedIn Outreach Assistant',
  heading: 'Outreach on a platform you do not control',
  description:
    'The constraints that define this problem: platform terms, automation detection, account risk, and the assist-rather-than-automate design that avoids them.',
  keywords: [
    'linkedin outreach assistant',
    'linkedin automation risk',
    'platform terms of service',
    'automation detection',
    'account ban risk',
    'assistive automation',
    'professional network outreach',
    'compliant outreach tool',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['outreach assistant', 'automation detection'],
  excerpt:
    'The technical question is how to automate this. The answer is that you largely should not, and the interesting design is what you build instead.',
  keyTakeaways: [
    'Platform terms prohibit automated access, and enforcement lands on the user’s account.',
    'Detection uses behavioural shape, which randomised delays do not disguise.',
    'Almost all the value — drafting, tracking, reminders — requires no platform access at all.',
    'A sanctioned integration is the only version still working in two years.',
    'If you build it anyway, state the risk plainly before an account is connected.',
  ],
  sections: [
    {
      heading: 'The terms are the binding constraint',
      paragraphs: [
        'Major professional networks prohibit automated access, scraping and unauthorised tools in their terms of service, and they enforce it. This is not a grey area you can engineer around — it is a stated condition of using the platform.',
        'The consequence lands on your user, not on you. Their account is the one restricted or removed, along with their network and their history, and for many people that account is a substantial professional asset.',
        'The asymmetry is what makes this a product decision rather than a technical one. A vendor whose tool triggers a restriction loses a customer; the candidate loses the network they spent a decade building, at precisely the moment they are relying on it.',
      ],
    },
    {
      heading: 'Detection is better than people assume',
      paragraphs: [
        'Automation is identified from behavioural patterns, not just from a user agent string: timing regularity, action sequences, volume distributions, session characteristics. Randomised delays and headless browser tweaks do not hide the shape of a script.',
        'Tools that promise undetectable automation are selling something they cannot deliver, and the person who bears the outcome is the candidate whose account disappears.',
        'Cross-account patterns are the part vendors cannot control at all. A thousand users of the same tool produce a recognisable collective signature regardless of how carefully any individual session is disguised, which is why these products tend to work until they abruptly do not.',
      ],
      bullets: [
        'Timing regularity across actions',
        'Volumes and sequences no person produces',
        'Session and device fingerprint consistency',
        'Patterns visible across accounts using the same tool',
      ],
      table: {
        caption: 'What you can build, and what it costs',
        columns: ['Capability', 'Needs platform access', 'Risk'],
        rows: [
          ['Draft a message', 'No', 'None'],
          ['Suggest who to contact', 'No', 'None'],
          ['Track who was contacted', 'No', 'None'],
          ['Remind about follow-ups', 'No', 'None'],
          ['Send messages automatically', 'Yes', 'The user’s account'],
          ['Scrape profiles in bulk', 'Yes', 'Account plus legal exposure'],
        ],
      },
    },
    {
      heading: 'Assist instead of automate',
      paragraphs: [
        'Almost all the value here does not require touching the platform. Draft the message from the candidate’s profile and the role. Track who was contacted and when. Suggest who to contact and why. Remind about follow-ups.',
        'The user then sends it themselves, in two seconds, as a human action on a platform they are entitled to use. They get the drafting and the tracking; nobody gets their account restricted.',
        'The tracking is worth more than it sounds, because it is the part people do worst. Who was contacted, when, about which role and whether they replied is exactly the information that disappears from memory after three weeks — and keeping it needs no access to anything.',
      ],
    },
    {
      heading: 'Use the official routes where they exist',
      paragraphs: [
        'Where a platform offers a sanctioned API, use it within its stated limits, and accept that those limits are usually narrower than what an automation tool would do. That narrowness is the point.',
        'Building on a sanctioned integration means your product does not depend on evading detection, which is the only version of this that is still working in two years.',
        'Do not let a fallback undo the decision. A product that uses the API and quietly reverts to browser automation when a limit is reached has taken on all the risk it was avoiding, with the added problem that neither the user nor the team knows which path ran.',
      ],
    },
    {
      heading: 'The message still has to be worth sending',
      paragraphs: [
        'None of this matters if the output is a template. Recipients on professional networks receive a great deal of automated outreach and recognise the shape immediately — an opening compliment, a paragraph of generically relevant experience, a closing ask for fifteen minutes.',
        'One accurate specific sentence is what changes the outcome, and it has to come from somewhere: a piece of the recipient’s public work, a role change, something they wrote. The rest of the message can be perfectly ordinary.',
        'Build in refusal. When there is nothing specific to say, no message is the honest output, and a generative system will never reach that conclusion on its own — so the check belongs in code over the gathered facts rather than as an instruction.',
        'Cap the volume for the same reason. A candidate does not have a genuine connection to forty people a week, and beyond a modest number the system is manufacturing interest that does not exist — which recipients detect and which makes every later message worse.',
      ],
    },
    {
      heading: 'Be honest with users about the risk',
      paragraphs: [
        'If you do build anything that touches a platform in ways its terms do not permit, the user deserves to know clearly what they are risking before they connect their account — not in a clause nobody reads.',
        'Most will choose the assistive version once the trade-off is stated plainly. Presenting it as a routine feature, and letting them discover the risk when their account is gone, is the part that is genuinely indefensible.',
        'Never ask for a platform password. A tool requesting credentials rather than using a sanctioned authorisation flow has told the user something important about how it was built, and no feature justifies handing them over.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is automating LinkedIn outreach allowed?',
      a: 'No. Major professional networks prohibit automated access and unauthorised tools in their terms, and they enforce it — against your user account, not your product.',
    },
    {
      q: 'Can automation be made undetectable?',
      a: 'Not reliably. Detection uses behavioural patterns, and a thousand accounts running the same tool produce a collective signature no individual session can disguise.',
    },
    {
      q: 'What can you build instead?',
      a: 'An assistant: draft the message from the profile and role, track who was contacted, suggest who to contact and why, remind about follow-ups. The user sends it themselves in seconds.',
    },
    {
      q: 'What if I build it anyway?',
      a: 'Then tell the user plainly what they are risking before they connect their account. Most choose the assistive version once the trade-off is stated.',
    },
    {
      q: 'Is it acceptable to fall back to automation when an API limit is reached?',
      a: 'No. That takes on all the risk the sanctioned route avoided, with the added problem that nobody knows which path actually ran.',
    },
    {
      q: 'What makes an outreach message worth sending?',
      a: 'One accurate specific sentence about the recipient that could not have been written about anyone else. Without it, no message is the honest output.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'how-to-build-an-ai-follow-up-agent', 'how-to-safely-give-ai-agents-browser-access'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-safely-give-ai-agents-browser-access',
  tint: 'rose',
  title: 'How to Safely Give AI Agents Access to Your Browser',
  heading: 'Giving an agent browser access safely',
  description:
    'Why an agent in your logged-in browser inherits every session you hold, and how to give it the access it needs without the access it does not.',
  keywords: [
    'safe browser access ai agent',
    'ai agent browser security',
    'browser agent isolation',
    'agent session hijack risk',
    'browser profile for agents',
    'ai agent cookies risk',
    'secure browser automation',
    'agent egress control',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Security',
  excerpt:
    'Your browser holds every session you are signed into. An agent given that browser holds them too, and it takes instructions from web pages.',
  sections: [
    {
      heading: 'What you actually hand over',
      paragraphs: [
        'A browser profile is a credential store. It holds session cookies for your email, your bank, your employer’s systems and everything else you have not signed out of — which is everything.',
        'Running an agent in that profile grants it all of them at once. Nothing about the job-application task required access to your inbox, but the profile does not distinguish, and neither does an agent that has been persuaded by something it read.',
      ],
    },
    {
      heading: 'The combination that makes it dangerous',
      paragraphs: [
        'On its own, a browser with your sessions is just your browser. On its own, an agent that follows instructions in text is a curiosity. Together they are a system that holds your credentials and takes instructions from strangers.',
        'Every web page it visits is untrusted input. A page can contain text directed at the agent, invisible to you, and the agent has no reliable way to distinguish page content from your instruction.',
      ],
    },
    {
      heading: 'Use a dedicated profile, always',
      paragraphs: [
        'The single most effective step is a separate browser profile that has never been signed into anything except what the task requires. Not a private window in your main browser — a genuinely separate profile with its own cookie store.',
        'Sign it into the job boards it needs and nothing else. If it is compromised, the loss is a job board session rather than your email, and that difference is the entire security posture.',
      ],
      bullets: [
        'A separate profile, not an incognito window of your main one',
        'Signed into only the sites the task requires',
        'No password manager extension installed',
        'Cleared between sessions where practical',
        'Never the profile you use for banking or work systems',
      ],
    },
    {
      heading: 'Restrict where it can go',
      paragraphs: [
        'Exfiltration requires reaching an attacker-controlled destination. An allowlist of domains the agent may navigate to turns a successful injection into a failed one, because the instruction to send data somewhere cannot be carried out.',
        'This is more effective than trying to detect malicious instructions, and considerably easier to reason about. You do not need to anticipate the attack; you need to make the payoff unreachable.',
      ],
    },
    {
      heading: 'Watch what it did, not what it said',
      paragraphs: [
        'Record the navigation history, every form submission with its values, and screenshots at decision points. The agent’s own account of what it did is not evidence — it is output from the same system you are investigating.',
        'Review those records the first several runs rather than trusting the summary. This is where people discover their agent logged into something they did not expect, or submitted a form twice, and it is cheap to catch early.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can I run a browser agent in my normal browser profile?',
      a: 'You should not. That profile holds live sessions for your email, bank and work systems, and the agent inherits all of them while also taking instructions from every page it reads.',
    },
    {
      q: 'Is an incognito window enough isolation?',
      a: 'No. It shares the browser installation and often extensions, and it is not a credential boundary. Use a genuinely separate profile with its own cookie store.',
    },
    {
      q: 'What is the most effective single control?',
      a: 'A domain allowlist for navigation. Exfiltration needs an attacker-controlled destination, so making that unreachable defeats the attack without needing to detect it.',
    },
    {
      q: 'How do I verify what the agent did?',
      a: 'From navigation history, recorded form submissions and screenshots — not from the agent’s own summary, which comes from the same system you are trying to check.',
    },
  ],
  related: ['ai-agent-security-permissions-sandboxing', 'how-to-secure-an-ai-browser-agent', 'how-to-handle-authentication-in-ai-browser-agents'],
};

export default post;

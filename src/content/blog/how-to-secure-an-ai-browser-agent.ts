import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-secure-an-ai-browser-agent',
  tint: 'rose',
  title: 'How to Secure an AI Browser Agent',
  heading: 'Securing a browser agent',
  description:
    'Hardening a browser agent: isolating the runtime, controlling navigation and egress, handling page content as untrusted, and detecting when it is being steered.',
  keywords: [
    'secure ai browser agent',
    'browser agent hardening',
    'agent navigation allowlist',
    'browser agent sandbox',
    'untrusted web content ai',
    'browser agent egress control',
    'web agent security',
    'headless browser security',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'A browser agent reads attacker-controlled content by design. Security is therefore about what it can do afterwards, not about what it reads.',
  sections: [
    {
      heading: 'Every page is hostile input',
      paragraphs: [
        'A browser agent visits pages nobody vetted. Any of them can contain text addressed to the agent — in a comment, in white-on-white text, in an image, in an attribute — and the agent has no reliable way to distinguish page content from operator instruction.',
        'So the defensive question is never "how do I stop it reading something bad". It is "what can it do once it has". Everything useful follows from accepting that the reading cannot be controlled.',
      ],
    },
    {
      heading: 'Isolate the runtime',
      paragraphs: [
        'Run the browser in a container or virtual machine with nothing valuable in it, a fresh profile per session, and no credentials on disk. Treat the environment as disposable and destroy it afterwards.',
        'This bounds the damage of any successful manipulation to that session. An agent that cannot reach your filesystem, your other sessions or your network cannot do much on an attacker’s behalf regardless of what it was told.',
      ],
      bullets: [
        'A container or VM, destroyed after each session',
        'A browser profile with no history and no stored logins',
        'No password manager, no extensions beyond what the task needs',
        'No credentials on disk; secrets injected at the moment of use',
      ],
    },
    {
      heading: 'Constrain navigation and egress',
      paragraphs: [
        'Allowlist the domains the agent may navigate to. A job agent needs a handful of job boards and employer careers pages, and nothing else — so a redirect to an attacker’s host simply fails.',
        'Restrict outbound network access at the container level too, not only in the browser. Exfiltration needs somewhere to go; removing the destinations defeats the attack without needing to detect it.',
      ],
    },
    {
      heading: 'Separate reading from acting',
      paragraphs: [
        'The highest-value structural control is refusing to let page content trigger consequential actions directly. Content the agent reads should inform a proposal; a separate, validated path performs anything with an effect.',
        'Concretely: the agent may read a form and propose values, and your code decides whether that submission is permitted for this candidate on this job. An instruction embedded in a page can influence the proposal and cannot reach the decision.',
      ],
    },
    {
      heading: 'Detect steering',
      paragraphs: [
        'Log navigation, every action with its arguments, and screenshots at decision points — then watch for the shapes that indicate manipulation rather than difficulty.',
        'Useful signals: navigation to a domain outside the expected set, an unusual number of steps on one page, the same action repeated, or the agent attempting a tool that the current task should not require. Any of them is worth halting on and reviewing, because the alternative is finding out afterwards.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do I stop a browser agent following instructions on a web page?',
      a: 'You largely cannot, and that is the wrong goal. Control what it can do afterwards: allowlist navigation, restrict egress, and route consequential actions through a validated path rather than letting page content trigger them.',
    },
    {
      q: 'What isolation does a browser agent need?',
      a: 'A container or VM destroyed after each session, a fresh profile with no stored logins, no credentials on disk, and outbound network restricted at the container level rather than only in the browser.',
    },
    {
      q: 'Why does an egress allowlist work so well?',
      a: 'Exfiltration needs a destination. Removing reachable destinations defeats the attack without requiring you to detect or anticipate the instruction that caused it.',
    },
    {
      q: 'How can I tell if my agent is being manipulated?',
      a: 'Watch for navigation outside the expected domains, unusual step counts on one page, repeated identical actions, or attempts to use tools the task should not need. Halt and review rather than continuing.',
    },
  ],
  related: ['how-to-safely-give-ai-agents-browser-access', 'ai-job-agents-and-prompt-injection', 'how-to-build-reliable-browser-automation'],
};

export default post;

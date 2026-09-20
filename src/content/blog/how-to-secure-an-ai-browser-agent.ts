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
  anchors: ['securing a browser agent', 'hostile input'],
  excerpt:
    'A browser agent reads attacker-controlled content by design. Security is therefore about what it can do afterwards, not about what it reads.',
  keyTakeaways: [
    'The reading cannot be controlled, so everything useful follows from bounding what happens next.',
    'A disposable runtime confines the damage of any successful manipulation to one session.',
    'Egress restriction defeats exfiltration without requiring you to anticipate the attack.',
    'Page content may inform a proposal and must never trigger a consequential action directly.',
    'Watch for steering shapes — off-domain navigation, repeated actions, unexpected tools.',
  ],
  sections: [
    {
      heading: 'Every page is hostile input',
      paragraphs: [
        'A browser agent visits pages nobody vetted. Any of them can contain text addressed to the agent — in a comment, in white-on-white text, in an image, in an attribute — and the agent has no reliable way to distinguish page content from operator instruction.',
        'So the defensive question is never "how do I stop it reading something bad". It is "what can it do once it has". Everything useful follows from accepting that the reading cannot be controlled.',
        'Job boards are an unusually exposed case because the content is written by third parties and rendered on a site the agent has reason to trust. A job description is a document from a stranger delivered through a domain on your allowlist.',
      ],
    },
    {
      heading: 'Isolate the runtime',
      paragraphs: [
        'Run the browser in a container or virtual machine with nothing valuable in it, a fresh profile per session, and no credentials on disk. Treat the environment as disposable and destroy it afterwards.',
        'This bounds the damage of any successful manipulation to that session. An agent that cannot reach your filesystem, your other sessions or your network cannot do much on an attacker’s behalf regardless of what it was told.',
        'Isolate per candidate as well as per session. Reusing a browser profile across users to save startup time carries one person’s cookies into another’s run, which is a data breach with no attacker required.',
      ],
      bullets: [
        'A container or VM, destroyed after each session',
        'A browser profile with no history and no stored logins',
        'No password manager, no extensions beyond what the task needs',
        'No credentials on disk; secrets injected at the moment of use',
      ],
      table: {
        caption: 'Controls, and what each one actually stops',
        columns: ['Control', 'Stops', 'Does not stop'],
        rows: [
          ['Disposable runtime', 'Persistence and lateral reach', 'The injection itself'],
          ['Navigation allowlist', 'Redirects to attacker hosts', 'Requests made without navigating'],
          ['Egress restriction', 'Exfiltration', 'On-site damage'],
          ['Read/act separation', 'Page text causing an action', 'A bad proposal being made'],
          ['Narrow tool set', 'Reaching for a capability', 'Misuse of a granted one'],
          ['Action logging', 'Nothing', 'But it is how you find out'],
        ],
      },
    },
    {
      heading: 'Constrain navigation and egress',
      paragraphs: [
        'Allowlist the domains the agent may navigate to. A job agent needs a handful of job boards and employer careers pages, and nothing else — so a redirect to an attacker’s host simply fails.',
        'Restrict outbound network access at the container level too, not only in the browser. Exfiltration needs somewhere to go; removing the destinations defeats the attack without needing to detect it.',
        'A page can issue a request without navigating anywhere, which is precisely why the browser-level allowlist is insufficient on its own. Blocking at the network layer covers the channels the navigation rule never sees.',
      ],
    },
    {
      heading: 'Separate reading from acting',
      paragraphs: [
        'The highest-value structural control is refusing to let page content trigger consequential actions directly. Content the agent reads should inform a proposal; a separate, validated path performs anything with an effect.',
        'Concretely: the agent may read a form and propose values, and your code decides whether that submission is permitted for this candidate on this job. An instruction embedded in a page can influence the proposal and cannot reach the decision.',
        'That validator is where the rules that cannot be argued with live: this origin is allowed, this action type is permitted here, this field is on the never-fill list, this submission has a recorded human confirmation. None of them is reachable by the component that reads the page.',
        'Keep the tool set narrow for the same reason. An agent that can read a posting and fill a form does not need to send email, download files or execute script, and a capability that does not exist cannot be reached for however persuasive the page was.',
      ],
    },
    {
      heading: 'Treat the agent’s output as untrusted too',
      paragraphs: [
        'Text the model produces has passed through content written by strangers, so anything it emits that reaches a database, a shell, a URL or a template is an injection vector. The fact that it came from your own agent is not a reason to trust it.',
        'Validate on the way out as well as in: a field value against an expected shape, a URL against the allowlist, an identifier against something you issued rather than something the model composed.',
        'Never let the model supply the identifiers that decide scope. The candidate and the job should come from the verified session and an explicit parameter, because an id the model can produce is an id a page can influence.',
      ],
    },
    {
      heading: 'Detect steering',
      paragraphs: [
        'Log navigation, every action with its arguments, and screenshots at decision points — then watch for the shapes that indicate manipulation rather than difficulty.',
        'Useful signals: navigation to a domain outside the expected set, an unusual number of steps on one page, the same action repeated, or the agent attempting a tool that the current task should not require. Any of them is worth halting on and reviewing, because the alternative is finding out afterwards.',
        'Record refusals as well as actions. A run repeatedly attempting a blocked origin or a withheld capability is the clearest evidence available that something is steering it, and it is invisible in a log that only captures what succeeded.',
        'Give those logs the handling they deserve. They contain page content, form values and candidate data, so they need a retention limit and the same access controls as the primary records rather than sitting in an unexamined bucket.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do I stop a browser agent following instructions on a web page?',
      a: 'You largely cannot, and that is the wrong goal. Control what it can do afterwards: allowlist navigation, restrict egress, and route consequential actions through a validated path.',
    },
    {
      q: 'What isolation does a browser agent need?',
      a: 'A container or VM destroyed after each session, a fresh profile with no stored logins, no credentials on disk, and isolation per candidate as well as per session.',
    },
    {
      q: 'Why does an egress allowlist work so well?',
      a: 'Exfiltration needs a destination. Removing reachable destinations defeats the attack without requiring you to detect or anticipate the instruction that caused it.',
    },
    {
      q: 'How can I tell if my agent is being manipulated?',
      a: 'Watch for navigation outside the expected domains, unusual step counts, repeated identical actions, and attempted use of blocked capabilities — log refusals, not just successes.',
    },
    {
      q: 'Is a navigation allowlist enough?',
      a: 'No. A page can make a request without navigating, so outbound traffic has to be restricted at the network layer as well.',
    },
    {
      q: 'Should the agent supply the candidate or job identifier?',
      a: 'Never. Those come from the verified session and an explicit parameter, because an id the model produces is an id a page can influence.',
    },
  ],
  related: ['how-to-safely-give-ai-agents-browser-access', 'ai-job-agents-and-prompt-injection', 'how-to-build-reliable-browser-automation'],
  references: [
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'Prompt injection, excessive agency and insecure output handling.',
    },
  ],
};

export default post;

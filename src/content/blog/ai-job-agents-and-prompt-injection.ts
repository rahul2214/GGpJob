import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-job-agents-and-prompt-injection',
  tint: 'rose',
  title: 'AI Job Agents and Prompt Injection: What Developers Need to Know',
  heading: 'Prompt injection in job agents',
  description:
    'Job agents read text written by strangers and can act on it. The injection paths specific to job automation, and the controls that actually contain them.',
  keywords: [
    'prompt injection job agent',
    'ai agent security jobs',
    'indirect prompt injection resume',
    'job description injection attack',
    'agent tool permissions',
    'llm security job automation',
    'malicious job posting ai',
    'secure job agent',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'A job agent reads documents written by people who want something from it, and can send email and submit forms. That combination is the whole problem.',
  sections: [
    {
      heading: 'Why job agents are an unusually exposed case',
      paragraphs: [
        'Most of what a job agent processes was written by a stranger with an interest in the outcome: job descriptions by employers and agencies, CVs by candidates, emails by recruiters and by people pretending to be recruiters.',
        'It also holds capabilities worth attacking: it can send messages, submit forms, and it has access to personal data. Untrusted input plus meaningful capability is the exact precondition for indirect prompt injection, and job automation has both by design.',
      ],
    },
    {
      heading: 'The injection paths specific to this domain',
      paragraphs: [
        'Each of these is content the agent must read to do its job, which is why none of them can simply be excluded.',
        'The recruiter-side ones are worth particular attention. A screening agent reading CVs is processing documents from people who know it is automated and have a direct incentive to influence it.',
      ],
      bullets: [
        'A job description containing instructions aimed at the agent reading it',
        'A CV with text sized or coloured to be invisible to a human reviewer',
        'A recruiter email instructing the agent to send information',
        'A careers page whose markup differs from what it renders',
        'A forged prior turn, where conversation history is supplied by the client',
      ],
    },
    {
      heading: 'What an attacker can realistically achieve',
      paragraphs: [
        'On the candidate side: exfiltrating a CV and personal details to an address of the attacker’s choosing, or suppressing applications to a competitor’s roles. On the employer side: promoting a CV past screening, or getting a competitor’s candidates rejected.',
        'The damaging cases all require the agent to be able to *do* something — send, submit, write. An agent that can only read and present findings to a human has a much smaller attack surface, which is the single most useful design observation in this area.',
      ],
    },
    {
      heading: 'Controls that work',
      paragraphs: [
        'Filtering injection phrases helps against opportunistic attempts and will not stop a motivated attacker, because the ways to phrase an instruction are unbounded. Useful as a speed bump, wrong as a boundary.',
        'What works is limiting capability. An agent with no send tool cannot be talked into sending. A submission that requires human confirmation cannot be triggered by a document. Credentials scoped to one candidate cannot reach another’s data however persuasive the text was.',
      ],
      bullets: [
        'Least privilege on every tool — most agents need far fewer than they are given',
        'Human confirmation on anything outbound or irreversible',
        'Untrusted text never merged into system instructions',
        'Client-supplied history replayed as user content, never as assistant turns',
        'Logging that ties each action back to the input that caused it',
      ],
    },
    {
      heading: 'Test it deliberately',
      paragraphs: [
        'Put an injected instruction into a job description in your own test data and run the pipeline. Most teams discover their agent obeys it, and discover it for the first time in an environment where that is harmless.',
        'Make this a standing test rather than a one-off. Injection resistance is not a property you achieve; it degrades whenever the prompt, the tools or the model change, so it belongs in the evaluation suite alongside quality.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why are job agents especially exposed to prompt injection?',
      a: 'Almost everything they read — job descriptions, CVs, recruiter emails — is written by someone with an interest in the outcome, and the agent can send messages and submit forms. Untrusted input plus real capability is the precondition.',
    },
    {
      q: 'Can filtering stop injection in job descriptions?',
      a: 'It stops opportunistic attempts and nothing more. The ways to phrase an instruction are unbounded, so treat filtering as a speed bump and put the real control in what the agent is permitted to do.',
    },
    {
      q: 'What is the single most effective control?',
      a: 'Removing capability. An agent that cannot send cannot be talked into sending, and a submission gated behind human confirmation cannot be triggered by a document it read.',
    },
    {
      q: 'How do I test my agent against injection?',
      a: 'Plant an injected instruction in a test job description and run the pipeline — most teams find it obeys. Then keep that test in the evaluation suite, because resistance degrades whenever prompts, tools or models change.',
    },
  ],
  related: ['what-is-prompt-injection', 'ai-agent-security-permissions-sandboxing', 'how-to-build-a-secure-ai-job-application-platform'],
};

export default post;

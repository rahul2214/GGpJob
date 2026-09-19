import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-agent-security-permissions-sandboxing',
  tint: 'rose',
  title: 'AI Agent Security: Permissions, Sandboxing and Tool Access',
  heading: 'Agent permissions and sandboxing',
  description:
    'How to scope what an AI agent can reach: designing tool permissions, sandboxing execution, containing blast radius, and auditing what actually happened.',
  keywords: [
    'ai agent security',
    'agent tool permissions',
    'sandboxing ai agents',
    'least privilege ai agent',
    'agent blast radius',
    'secure agent architecture',
    'ai agent credentials',
    'agent audit logging',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'You cannot make an agent refuse reliably. You can make the thing it was asked to do impossible, which is a different and far more dependable guarantee.',
  sections: [
    {
      heading: 'Design for a compromised model',
      paragraphs: [
        'Assume the model will, at some point, decide to do the worst thing its tools permit. Not because it is malicious, but because some text it processed persuaded it, or because it misread a situation.',
        'Once that is the assumption, security stops being about prompt wording and becomes an ordinary authorisation problem — which is good news, because that is a problem the industry knows how to solve.',
      ],
    },
    {
      heading: 'Tool design is permission design',
      paragraphs: [
        'Every tool you expose is a capability grant. The common mistake is exposing a general-purpose tool — run this query, call this endpoint, execute this command — because it is easier than writing several specific ones.',
        'A general tool is an unbounded grant. `run_sql(query)` gives the agent your whole database; `get_applications_for_candidate(id)` gives it exactly what the task needs. Specific tools are more work to write and they are the actual security boundary.',
      ],
      bullets: [
        'Task-shaped tools, never general execution primitives',
        'Parameters constrained by type and range, validated server-side',
        'Read and write separated into different tools',
        'Destructive operations behind an explicit confirmation path',
        'Nothing that accepts raw code, SQL or shell input',
      ],
    },
    {
      heading: 'Scope credentials to the request, not the service',
      paragraphs: [
        'An agent acting for one candidate should hold a credential that can only reach that candidate’s data. Giving it the service account and relying on it to filter correctly means one reasoning error becomes a data breach across every user.',
        'This is the control that turns a catastrophic failure into a contained one. It is also the one most often skipped, because service credentials are simpler to wire up during development and nobody revisits it.',
      ],
    },
    {
      heading: 'Sandbox anything that executes',
      paragraphs: [
        'If an agent runs code, browses the web or operates a desktop, it needs isolation with nothing valuable inside it: a container or virtual machine, no standing credentials on disk, restricted network egress, and a clean state per session.',
        'Egress restriction deserves emphasis. An agent that can reach any host can exfiltrate whatever it holds, and exfiltration is the goal of most injection attacks. An allowlist of destinations turns a successful injection into a failed one.',
      ],
    },
    {
      heading: 'Bound the loop',
      paragraphs: [
        'Autonomy needs ceilings that are enforced in code rather than requested in a prompt: maximum steps, maximum tool calls, maximum spend, maximum wall-clock time. A runaway loop is the most likely incident you will actually have.',
        'Also bound repetition. An agent calling the same tool with the same arguments five times is stuck, and continuing costs money without progress. Detecting and halting on that is a small piece of code that pays for itself the first week.',
      ],
    },
    {
      heading: 'Audit so you can reconstruct',
      paragraphs: [
        'When something goes wrong the question is always which input caused which action. That is unanswerable unless you logged the assembled context, every tool call with its arguments and result, and the final output.',
        'Retain enough to replay a session. Teams that log only errors discover that the interesting failures produced no error at all — the agent did something wrong, successfully.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most important AI agent security control?',
      a: 'Least privilege on tools. You cannot make a model refuse reliably, but you can make the action impossible — an agent without a delete tool cannot be persuaded to delete.',
    },
    {
      q: 'Why are general-purpose tools dangerous?',
      a: 'They are unbounded permission grants. `run_sql(query)` hands over the whole database; a task-shaped tool gives exactly what the job needs. Specific tools are the real security boundary.',
    },
    {
      q: 'Should an agent use a service account?',
      a: 'No — scope credentials to the request, so an agent acting for one user can only reach that user’s data. Otherwise a single reasoning error becomes a breach across every user.',
    },
    {
      q: 'What limits should an agent loop have?',
      a: 'Maximum steps, tool calls, spend and wall-clock time, all enforced in code rather than requested in the prompt — plus detection of repeated identical calls, which means it is stuck.',
    },
  ],
  related: ['ai-job-agents-and-prompt-injection', 'how-to-safely-give-ai-agents-browser-access', 'how-to-protect-user-credentials-in-ai-job-automation'],
};

export default post;

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
  anchors: ['agent permissions', 'sandboxing'],
  excerpt:
    'You cannot make an agent refuse reliably. You can make the thing it was asked to do impossible, which is a different and far more dependable guarantee.',
  keyTakeaways: [
    'Assume the model will eventually do the worst thing its tools permit, then design from there.',
    'Every tool is a capability grant; a general-purpose tool is an unbounded one.',
    'Scope credentials to the request, not the service — this turns a breach into a contained failure.',
    'Egress restriction defeats exfiltration, which is the goal of most injection attacks.',
    'Bound the loop in code: steps, calls, spend, time, and repeated identical actions.',
  ],
  sections: [
    {
      heading: 'Design for a compromised model',
      paragraphs: [
        'Assume the model will, at some point, decide to do the worst thing its tools permit. Not because it is malicious, but because some text it processed persuaded it, or because it misread a situation.',
        'Once that is the assumption, security stops being about prompt wording and becomes an ordinary authorisation problem — which is good news, because that is a problem the industry knows how to solve.',
        'It is the same move as treating user input as hostile in a web application. Nobody argues about whether a particular user is trustworthy; the input is validated regardless, and agent capability deserves the same unconditional treatment.',
      ],
    },
    {
      heading: 'Tool design is permission design',
      paragraphs: [
        'Every tool you expose is a capability grant. The common mistake is exposing a general-purpose tool — run this query, call this endpoint, execute this command — because it is easier than writing several specific ones.',
        'A general tool is an unbounded grant. `run_sql(query)` gives the agent your whole database; `get_applications_for_candidate(id)` gives it exactly what the task needs. Specific tools are more work to write and they are the actual security boundary.',
        'The test to apply to each tool is what its worst legitimate-looking invocation could do. If the answer involves data belonging to someone else, or an action nobody could undo, the tool is too broad regardless of how carefully its description is worded.',
      ],
      bullets: [
        'Task-shaped tools, never general execution primitives',
        'Parameters constrained by type and range, validated server-side',
        'Read and write separated into different tools',
        'Destructive operations behind an explicit confirmation path',
        'Nothing that accepts raw code, SQL or shell input',
      ],
      table: {
        caption: 'The same capability, granted broadly and narrowly',
        columns: ['Broad tool', 'What it really grants', 'Narrow replacement'],
        rows: [
          ['run_sql(query)', 'The entire database', 'get_applications(candidate_id)'],
          ['http_request(url)', 'Any host, including exfiltration', 'fetch_posting(posting_id)'],
          ['run_shell(cmd)', 'The whole machine', 'convert_document(file_id)'],
          ['send_email(to, body)', 'Any recipient', 'reply_to_thread(thread_id, body)'],
          ['write_file(path)', 'Anywhere on disk', 'save_draft(application_id, body)'],
        ],
      },
    },
    {
      heading: 'Scope credentials to the request, not the service',
      paragraphs: [
        'An agent acting for one candidate should hold a credential that can only reach that candidate’s data. Giving it the service account and relying on it to filter correctly means one reasoning error becomes a data breach across every user.',
        'This is the control that turns a catastrophic failure into a contained one. It is also the one most often skipped, because service credentials are simpler to wire up during development and nobody revisits it.',
        'The practical implementation is to mint a short-lived, scoped token per run rather than reading a long-lived secret from configuration. It also gives you revocation and an audit trail for free, both of which you will want during an incident.',
      ],
    },
    {
      heading: 'Sandbox anything that executes',
      paragraphs: [
        'If an agent runs code, browses the web or operates a desktop, it needs isolation with nothing valuable inside it: a container or virtual machine, no standing credentials on disk, restricted network egress, and a clean state per session.',
        'Egress restriction deserves emphasis. An agent that can reach any host can exfiltrate whatever it holds, and exfiltration is the goal of most injection attacks. An allowlist of destinations turns a successful injection into a failed one.',
        'Clean state per session matters more than it appears. An agent that retains files, cookies or a browser profile between runs carries one user’s session into another’s, which is a data leak that no amount of prompt discipline prevents.',
      ],
      bullets: [
        'A fresh container or VM per session, destroyed afterwards',
        'No long-lived credentials written to disk inside it',
        'Network egress limited to an allowlist of required hosts',
        'Resource ceilings so a runaway process cannot exhaust the host',
        'No shared browser profile, cookie jar or cache between users',
      ],
    },
    {
      heading: 'Bound the loop',
      paragraphs: [
        'Autonomy needs ceilings that are enforced in code rather than requested in a prompt: maximum steps, maximum tool calls, maximum spend, maximum wall-clock time. A runaway loop is the most likely incident you will actually have.',
        'Also bound repetition. An agent calling the same tool with the same arguments five times is stuck, and continuing costs money without progress. Detecting and halting on that is a small piece of code that pays for itself the first week.',
        'Decide in advance what happens at the ceiling. Stopping silently produces a task that nobody knows failed; escalating with the trace and the partial state produces something a person can finish. The second is barely more work and considerably more useful.',
      ],
    },
    {
      heading: 'Separate the reader from the actor',
      paragraphs: [
        'The strongest structural control available is splitting the component that consumes untrusted content from the component that can act on the world. One reads and proposes; the other validates and executes.',
        'The reader holds no tools at all. It returns a typed proposal — this posting, these fields, this recipient — and a separate validator checks that proposal against policy: is the recipient in the allowed set, is the posting one the user selected, is this action on the confirmation list.',
        'This is what makes a successful injection harmless rather than merely less likely. The model can be completely persuaded and still have no path to an action, because the persuaded component was never the one holding the capability.',
      ],
    },
    {
      heading: 'Audit so you can reconstruct',
      paragraphs: [
        'When something goes wrong the question is always which input caused which action. That is unanswerable unless you logged the assembled context, every tool call with its arguments and result, and the final output.',
        'Retain enough to replay a session. Teams that log only errors discover that the interesting failures produced no error at all — the agent did something wrong, successfully.',
        'Balance that against what the logs now contain. Full agent traces hold personal data and sometimes credentials in tool arguments, so redact at write time and set a retention period deliberately rather than keeping everything indefinitely by default.',
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
    {
      q: 'What is the strongest structural defence?',
      a: 'Separating the component that reads untrusted content from the one that acts. The reader emits a typed proposal with no tools; a validator checks it against policy before anything executes.',
    },
    {
      q: 'Is there a downside to detailed agent logging?',
      a: 'Yes — full traces contain personal data and sometimes credentials in tool arguments. Redact at write time and set a retention period deliberately rather than keeping everything by default.',
    },
  ],
  related: ['ai-job-agents-and-prompt-injection', 'how-to-safely-give-ai-agents-browser-access', 'how-to-protect-user-credentials-in-ai-job-automation'],
  references: [
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'Excessive agency and insecure output handling are the categories this article addresses.',
    },
    {
      title: 'OWASP Top Ten',
      url: 'https://owasp.org/www-project-top-ten/',
      publisher: 'OWASP',
      note: 'Broken access control sits at the top, and an over-scoped agent credential is exactly that.',
    },
  ],
};

export default post;

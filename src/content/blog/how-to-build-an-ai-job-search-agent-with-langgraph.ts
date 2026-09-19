import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-search-agent-with-langgraph',
  tint: 'indigo',
  title: 'How to Build an AI Job Search Agent With LangGraph',
  heading: 'A job search agent as a graph',
  description:
    'Modelling a job search agent as an explicit graph: state design, checkpointing, human-in-the-loop interrupts, retries and when a graph is overkill.',
  keywords: [
    'langgraph job agent',
    'agent graph architecture',
    'stateful agent workflow',
    'checkpointing agents',
    'human in the loop agent',
    'agent state design',
    'durable agent execution',
    'agent orchestration',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'The reason to model an agent as a graph is not elegance. It is that a job search runs for days and something will crash in the middle.',
  sections: [
    {
      heading: 'Why a graph instead of a loop',
      paragraphs: [
        'A simple while-loop agent works until it needs to stop for approval, resume tomorrow, retry one failed step without redoing the rest, or be inspected after a bad run. Then the loop has no answer, because its state lives in local variables that vanish.',
        'Modelling the process as nodes and edges makes the state explicit and serialisable. Where the agent is, what it has decided and what remains become data — which is what makes pausing, resuming and debugging possible at all.',
      ],
    },
    {
      heading: 'Design the state, then the nodes',
      paragraphs: [
        'The state object is the real design work. Everything a node needs must be in it, because nodes should not read hidden context, and everything in it is carried forward, so it grows if you are careless.',
        'Keep identifiers and decisions, not raw payloads. Store which jobs were selected and why, not the full text of every posting retrieved — the state is a record of the process, not a cache of everything the agent saw.',
      ],
      bullets: [
        'The profile and target criteria, resolved once',
        'Jobs under consideration, as identifiers plus a short decision note',
        'What has been approved, submitted and confirmed',
        'A cursor for where the run stopped, so resuming is unambiguous',
      ],
    },
    {
      heading: 'Checkpointing is the point',
      paragraphs: [
        'Persist the state after every node. A job search agent is long-running by nature: it waits for a user to approve applications, for a site to become reachable, for tomorrow’s postings to appear.',
        'With checkpoints, a crash costs one node. Without them, it costs the run — and worse, a restart may resubmit applications that already went out, which is the failure users will not forgive.',
      ],
    },
    {
      heading: 'Approval is an interrupt, not a prompt',
      paragraphs: [
        'The correct shape for human approval is a node that stops the graph, persists, and waits. The run resumes later, from the same state, with the human decision as an input.',
        'The wrong shape is asking the model to seek permission in its output, which is a request the model can talk itself out of. An interrupt cannot be reasoned around because it is control flow, not instruction.',
      ],
    },
    {
      heading: 'Retry the node, not the run',
      paragraphs: [
        'When submitting to one site fails, you want to retry that submission — not re-run the search, re-score every posting and re-ask for approval. Node-level retry with a bounded count keeps failures local.',
        'Make submission idempotent with a key derived from the candidate and the posting, so a retry that partially succeeded before does not produce a second application. Duplicate applications are the most visible way an automated agent embarrasses its user.',
      ],
    },
    {
      heading: 'When a graph is too much',
      paragraphs: [
        'For a single-shot task that finishes in one request — score this posting, extract these skills — a graph adds ceremony with no return. Call the model and be done.',
        'The graph earns its keep when there is real duration, real branching and real human involvement. A full job search has all three; most individual features do not.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why model a job agent as a graph rather than a loop?',
      a: 'Because the state becomes explicit and serialisable. A loop cannot pause for approval, resume tomorrow, retry one failed step or be inspected after a bad run — its state lives in variables that vanish.',
    },
    {
      q: 'What belongs in agent state?',
      a: 'Identifiers and decisions — which jobs were selected and why, what was approved and submitted, where the run stopped. Not the raw text of every posting retrieved.',
    },
    {
      q: 'How should human approval work in an agent graph?',
      a: 'As an interrupt that stops the graph, persists state and waits for a decision to resume with. Asking the model to seek permission in its output is a request it can reason its way around.',
    },
    {
      q: 'How do I avoid duplicate applications on retry?',
      a: 'Retry at the node level, and make submission idempotent with a key derived from the candidate and the posting, so a partially succeeded attempt cannot produce a second application.',
    },
  ],
  related: ['how-to-build-a-long-running-ai-agent', 'how-to-build-an-ai-agent-with-human-approval', 'how-to-build-reliable-ai-agents'],
};

export default post;

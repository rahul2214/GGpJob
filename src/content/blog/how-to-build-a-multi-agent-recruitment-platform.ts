import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-multi-agent-recruitment-platform',
  tint: 'indigo',
  title: 'How to Build a Multi-Agent Recruitment Platform',
  heading: 'Agents on both sides of the market',
  description:
    'Designing a platform where candidates and employers both have agents: isolation between them, shared state, conflict of interest, and keeping the market honest.',
  keywords: [
    'multi agent recruitment platform',
    'two sided marketplace ai',
    'candidate and employer agents',
    'agent isolation',
    'conflict of interest platform',
    'marketplace integrity',
    'recruitment automation platform',
    'agent architecture marketplace',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'When both sides have agents, the platform is no longer a neutral venue — it is running both negotiators.',
  sections: [
    {
      heading: 'The agents serve opposed interests',
      paragraphs: [
        'A candidate’s agent maximises their chances; an employer’s agent filters efficiently. These goals conflict, and a platform operating both is in a position no participant would design for it.',
        'Be explicit about it. Each agent acts for one party, sees only that party’s data, and is evaluated on that party’s outcomes. A shared "helpful" agent serving everyone ends up quietly favouring whoever the platform earns more from.',
      ],
    },
    {
      heading: 'Isolate them properly',
      paragraphs: [
        'The isolation cannot be a prompt instruction. A candidate agent must be technically unable to read employer pipeline data, and an employer agent unable to read another employer’s candidates or a candidate’s private notes.',
        'Enforce it in the data layer with scoping tied to verified identity, and give each agent a distinct toolset. Then a mistake in an agent’s reasoning cannot become a data breach.',
      ],
      bullets: [
        'Separate toolsets per side, with no shared privileged tool',
        'Scoping enforced by the query, not by instruction',
        'No shared conversation context between sides',
        'Audit logs per agent, retained and reviewable',
      ],
    },
    {
      heading: 'Shared state needs one owner',
      paragraphs: [
        'Both sides act on the same objects — an application, an interview, a status. If either agent can write to them directly, you get races, contradictions and an audit trail nobody can reconstruct.',
        'Put state changes behind a service that both call, with explicit permitted transitions. An application moves from submitted to reviewed by the employer side only; the candidate side can withdraw. Encoding that as rules prevents an agent inventing a transition.',
      ],
    },
    {
      heading: 'Volume equilibrium breaks first',
      paragraphs: [
        'Candidate agents raise application volume; employer agents respond by filtering harder; candidates then apply more to compensate. The loop ends with enormous volume and no better matching for anyone.',
        'A platform can damp this deliberately — caps on applications, quality signals that outrank volume, employer response-rate transparency. Whether to is a product decision, but it is the platform’s to make, and declining to make it is also a choice.',
      ],
    },
    {
      heading: 'Say which side each agent works for',
      paragraphs: [
        'Users must know whose interests an agent represents. A candidate who believes the assistant is theirs, when it also optimises employer filtering, has been misled in a way that matters.',
        'Label it plainly in the interface and hold to it in behaviour. Trust in a two-sided marketplace is the asset, and an agent whose allegiance is ambiguous spends it quickly.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can one agent serve both candidates and employers?',
      a: 'Not honestly. Their goals conflict, and a shared agent ends up favouring whichever side the platform earns more from. Each agent should act for one party and be evaluated on that party outcomes.',
    },
    {
      q: 'How should the two sides be isolated?',
      a: 'Technically, not by prompt. Scoping enforced in the data layer against verified identity, distinct toolsets, and no shared context — so a reasoning mistake cannot become a breach.',
    },
    {
      q: 'How is shared state handled?',
      a: 'Through one service both sides call, with explicit permitted transitions. Direct writes from either agent produce races, contradictions and an unreconstructable audit trail.',
    },
    {
      q: 'What happens to application volume when both sides automate?',
      a: 'It escalates — candidates apply more, employers filter harder, repeat. The platform can damp it with caps and quality signals, and declining to do so is also a decision.',
    },
  ],
  related: ['how-to-build-a-multi-agent-job-search-system', 'ai-agents-vs-recruiters', 'how-to-build-an-ai-ats-scoring-system'],
};

export default post;

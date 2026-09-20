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
  anchors: ['recruitment platform', 'both sides of the market'],
  excerpt:
    'When both sides have agents, the platform is no longer a neutral venue — it is running both negotiators.',
  keyTakeaways: [
    'Each agent acts for one party and is evaluated on that party’s outcomes, or it quietly serves the platform.',
    'Isolation is enforced in the data layer, never by prompt.',
    'Shared objects need one owner and explicit permitted transitions.',
    'Both sides automating produces a volume spiral the platform can choose to damp.',
    'Trust is the asset in a two-sided market, and ambiguous allegiance spends it fast.',
  ],
  sections: [
    {
      heading: 'The agents serve opposed interests',
      paragraphs: [
        'A candidate’s agent maximises their chances; an employer’s agent filters efficiently. These goals conflict, and a platform operating both is in a position no participant would design for it.',
        'Be explicit about it. Each agent acts for one party, sees only that party’s data, and is evaluated on that party’s outcomes. A shared "helpful" agent serving everyone ends up quietly favouring whoever the platform earns more from.',
        'The pressure is structural rather than a matter of intent. Employers usually pay, so every ambiguous design decision has a gravitational pull towards employer outcomes, and the only defence is deciding allegiance explicitly at the architecture level rather than case by case under commercial pressure.',
      ],
    },
    {
      heading: 'Isolate them properly',
      paragraphs: [
        'The isolation cannot be a prompt instruction. A candidate agent must be technically unable to read employer pipeline data, and an employer agent unable to read another employer’s candidates or a candidate’s private notes.',
        'Enforce it in the data layer with scoping tied to verified identity, and give each agent a distinct toolset. Then a mistake in an agent’s reasoning cannot become a data breach.',
        'Inference leaks are the subtler version and deserve explicit thought. An employer agent that can see how many other employers viewed a candidate, or a candidate agent that can infer an employer’s pipeline from response timings, has learned something across the boundary without any data crossing it.',
      ],
      bullets: [
        'Separate toolsets per side, with no shared privileged tool',
        'Scoping enforced by the query, not by instruction',
        'No shared conversation context between sides',
        'Audit logs per agent, retained and reviewable',
        'Aggregates checked for what they reveal about the other side',
      ],
      table: {
        caption: 'What each side’s agent may touch',
        columns: ['Data', 'Candidate agent', 'Employer agent'],
        rows: [
          ['Own profile and documents', 'Read and write', 'No access'],
          ['Public postings', 'Read', 'Read'],
          ['Own pipeline', 'Own applications only', 'Own requisitions only'],
          ['Other employers’ pipelines', 'No access', 'No access'],
          ['Private candidate notes', 'Read and write', 'No access'],
          ['Cross-side aggregates', 'Only if it reveals nothing', 'Only if it reveals nothing'],
        ],
      },
    },
    {
      heading: 'Shared state needs one owner',
      paragraphs: [
        'Both sides act on the same objects — an application, an interview, a status. If either agent can write to them directly, you get races, contradictions and an audit trail nobody can reconstruct.',
        'Put state changes behind a service that both call, with explicit permitted transitions. An application moves from submitted to reviewed by the employer side only; the candidate side can withdraw. Encoding that as rules prevents an agent inventing a transition.',
        'Record the actor on every transition, including which agent acted and on whose behalf. When a candidate asks why their application was withdrawn, the answer has to be a fact in a log rather than a reconstruction, and that requirement only gets harder to add later.',
      ],
    },
    {
      heading: 'Volume equilibrium breaks first',
      paragraphs: [
        'Candidate agents raise application volume; employer agents respond by filtering harder; candidates then apply more to compensate. The loop ends with enormous volume and no better matching for anyone.',
        'A platform can damp this deliberately — caps on applications, quality signals that outrank volume, employer response-rate transparency. Whether to is a product decision, but it is the platform’s to make, and declining to make it is also a choice.',
        'Response-rate transparency is the intervention with the best ratio of effect to effort, because it constrains the side that has no other constraint. An employer whose response rate is visible to candidates has a reason to close requisitions and reply to applications, and neither behaviour was previously rewarded at all.',
      ],
    },
    {
      heading: 'Fairness stops being optional at this scale',
      paragraphs: [
        'A platform whose agents screen candidates is making employment decisions at volume, which puts it in scope for regulation that a neutral job board avoids. Whether the screening is a model or a rule makes no difference to that.',
        'The practical requirements are unglamorous: keep the inputs to a screening decision, keep the output and the reason, retain them long enough to answer a complaint, and be able to reproduce a decision made months ago. A system that cannot say why a candidate was filtered cannot defend it either.',
        'Measure outcomes by group rather than only checking that protected attributes are absent from the inputs. Proxies are abundant in this data — postcodes, institution names, employment gaps — and a screening system can produce a disparate outcome without any protected field ever being read.',
      ],
      bullets: [
        'Store the inputs, the output and the reason for every screening decision',
        'Be able to reproduce a decision months later, model version included',
        'Monitor outcomes by group, not just inputs',
        'A human able to overrule, with the overrule recorded',
        'A defined route for a candidate to contest a decision',
      ],
    },
    {
      heading: 'Say which side each agent works for',
      paragraphs: [
        'Users must know whose interests an agent represents. A candidate who believes the assistant is theirs, when it also optimises employer filtering, has been misled in a way that matters.',
        'Label it plainly in the interface and hold to it in behaviour. Trust in a two-sided marketplace is the asset, and an agent whose allegiance is ambiguous spends it quickly.',
        'Hold to it in the metrics as well, since that is where it fails first. If the candidate agent is measured on applications submitted rather than on offers the candidate accepted, it works for the platform regardless of what the label says.',
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
    {
      q: 'What does screening at platform scale require?',
      a: 'Stored inputs, outputs and reasons; reproducibility months later; outcome monitoring by group; a human able to overrule; and a route for candidates to contest.',
    },
    {
      q: 'How does allegiance fail even when it is labelled?',
      a: 'Through metrics. A candidate agent measured on applications submitted rather than offers accepted works for the platform, whatever the interface says.',
    },
  ],
  related: ['how-to-build-a-multi-agent-job-search-system', 'ai-agents-vs-recruiters', 'how-to-build-an-ai-ats-scoring-system'],
};

export default post;

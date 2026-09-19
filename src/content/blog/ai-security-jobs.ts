import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-security-jobs',
  tint: 'rose',
  title: 'AI Security Jobs in 2026: Roles, Skills and Salaries',
  heading: 'AI security jobs, mapped',
  description:
    'The AI security roles companies are actually hiring for, what each one does, the skills that get you shortlisted, and how the pay compares to conventional security work.',
  keywords: [
    'ai security jobs',
    'ai security engineer salary',
    'llm security jobs',
    'ai red team jobs',
    'ai security career',
    'machine learning security roles',
    'prompt injection jobs',
    'ai security hiring 2026',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'Three distinct jobs get advertised under one title. Knowing which one a posting means is the difference between a strong application and a confused interview.',
  sections: [
    {
      heading: 'Three different jobs, one job title',
      paragraphs: [
        'Postings for "AI Security Engineer" describe at least three roles with different daily work and different hiring bars. Reading which one a company means is the first filter to apply, because preparing for the wrong one wastes the interview.',
        'The confusion is understandable — the field is young and titles have not settled. But the skills barely overlap, and a candidate who prepares for adversarial testing and is interviewed on cloud controls will not do well.',
      ],
      bullets: [
        'Securing AI systems — protecting models, prompts, context and tool access from misuse',
        'AI for security — applying models to detection, triage and response in a SOC',
        'Governance and assurance — policy, risk assessment, audit and compliance evidence',
      ],
    },
    {
      heading: 'Securing AI systems',
      paragraphs: [
        'This is the most technical of the three and the closest to application security. The work is reasoning about a system that takes instructions from untrusted text and can invoke real actions, then finding the paths where that goes wrong.',
        'The novel part is that the attack surface includes content. A document your retrieval system ingests can carry instructions. An email your agent summarises can attempt to redirect it. Conventional input validation assumes data and instructions are separable, and here they are not.',
      ],
      bullets: [
        'Prompt injection, direct and indirect through retrieved content',
        'Tool and agent permission scoping, and confirming irreversible actions',
        'Data leakage through context windows and logs',
        'Model supply chain — weights, adapters and third-party components',
        'Output handling where generated text reaches a shell, query or browser',
      ],
    },
    {
      heading: 'AI for security operations',
      paragraphs: [
        'This role sits inside a security team and uses models to reduce alert volume, draft incident summaries and accelerate triage. The centre of gravity is security operations experience; the AI is a tool applied to a problem you already understand.',
        'Hiring managers here screen for detection engineering and incident response first. Candidates who lead with model knowledge and cannot discuss how an alert becomes an investigation tend not to progress.',
      ],
    },
    {
      heading: 'Governance and assurance',
      paragraphs: [
        'As AI regulation has firmed up, organisations need people who can document what a system does, assess its risks and produce evidence an auditor accepts. This is closer to GRC than to engineering, and it is hiring steadily in regulated sectors.',
        'It suits people with audit, risk or compliance backgrounds who have learned enough about model behaviour to ask useful questions. Deep engineering is not required; the ability to write precisely and hold a position under pressure is.',
      ],
    },
    {
      heading: 'What the pay actually looks like',
      paragraphs: [
        'Treat any specific figure sceptically — the sample is small and the titles are inconsistent. The pattern that holds is that AI security roles sit at or slightly above equivalent-seniority application security roles at the same company, and the premium comes from scarcity rather than from the work being harder.',
        'That premium will compress as supply catches up, which argues for entering on genuine capability rather than on title arbitrage. The durable position is being a strong security engineer who also understands these systems, not someone whose only asset is being early.',
      ],
    },
    {
      heading: 'How to enter from where you are',
      paragraphs: [
        'From security, you already have the mental model; add hands-on familiarity with how these systems are built. From engineering, you have the build knowledge; add structured threat modelling and the habit of thinking about misuse rather than use.',
        'Either way the evidence that travels is a written finding: a system you tested, what you found, why it mattered, what you recommended. One clear write-up outperforms a list of courses on a CV.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Do I need machine learning experience for AI security jobs?',
      a: 'For most roles, no. Securing AI systems is closer to application security than to model research. You need to understand how models are deployed, what they can invoke and where trust boundaries sit — not how to train one.',
    },
    {
      q: 'Which background moves into AI security most easily?',
      a: 'Application security and penetration testing, because the core skill — reasoning about how a system can be misused — transfers directly. Detection engineering transfers well into the security operations variant of the role.',
    },
    {
      q: 'Are AI security jobs well paid?',
      a: 'They currently sit at or slightly above comparable application security roles, driven mainly by scarcity. Expect that premium to narrow as more people qualify, so build the underlying capability rather than relying on the title.',
    },
    {
      q: 'What is the single most important AI security concept to learn first?',
      a: 'Prompt injection, particularly the indirect kind where instructions arrive inside retrieved content. It is the root of a large share of real incidents and it explains why conventional input validation is insufficient.',
    },
  ],
  related: ['how-to-become-an-ai-security-engineer', 'ai-governance-jobs', 'cybersecurity-roadmap'],
};

export default post;

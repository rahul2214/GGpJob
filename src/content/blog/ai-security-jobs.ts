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
  anchors: ['AI security', 'AI security roles'],
  excerpt:
    'Three distinct jobs get advertised under one title. Knowing which one a posting means is the difference between a strong application and a confused interview.',
  keyTakeaways: [
    'Three different jobs share the title: securing AI systems, AI for security operations, and governance.',
    'Securing AI systems is closest to application security — model training knowledge is rarely needed.',
    'The attack surface includes content, which breaks the assumption that data and instructions are separable.',
    'Pay sits at or slightly above equivalent application security roles, driven by scarcity rather than difficulty.',
    'A written security assessment of a system you were permitted to test is the evidence that travels.',
  ],
  sections: [
    {
      heading: 'Three different jobs, one job title',
      paragraphs: [
        'Postings for "AI Security Engineer" describe at least three roles with different daily work and different hiring bars. Reading which one a company means is the first filter to apply, because preparing for the wrong one wastes the interview.',
        'The confusion is understandable — the field is young and titles have not settled. But the skills barely overlap, and a candidate who prepares for adversarial testing and is interviewed on cloud controls will not do well.',
        'The reliable tell is in the responsibilities rather than the title. Mentions of red teaming and agent permissions indicate the first; alert triage and detection indicate the second; policy, audit and evidence indicate the third.',
      ],
      bullets: [
        'Securing AI systems — protecting models, prompts, context and tool access from misuse',
        'AI for security — applying models to detection, triage and response in a SOC',
        'Governance and assurance — policy, risk assessment, audit and compliance evidence',
      ],
      table: {
        caption: 'The three roles compared by background, daily work and hiring bar',
        columns: ['Role', 'Best background', 'Interviews test'],
        rows: [
          ['Securing AI systems', 'Application security, pentesting', 'Threat modelling an agent out loud'],
          ['AI for security operations', 'Detection engineering, SOC', 'How an alert becomes an investigation'],
          ['Governance and assurance', 'Audit, risk, compliance, law', 'Writing precisely, holding a position'],
        ],
      },
    },
    {
      heading: 'Securing AI systems',
      paragraphs: [
        'This is the most technical of the three and the closest to application security. The work is reasoning about a system that takes instructions from untrusted text and can invoke real actions, then finding the paths where that goes wrong.',
        'The novel part is that the attack surface includes content. A document your retrieval system ingests can carry instructions. An email your agent summarises can attempt to redirect it. Conventional input validation assumes data and instructions are separable, and here they are not.',
        'That single property is what makes the role genuinely new rather than a rebranding. Every other control you know still applies; what changes is that you can no longer sanitise your way out, because the malicious content and the legitimate content are the same kind of thing.',
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
        'It is also the variant with the clearest measurable value, which makes it easier to justify internally. Reducing time-to-triage on a queue nobody can keep up with is a number a security leader can take to a budget conversation.',
      ],
    },
    {
      heading: 'Governance and assurance',
      paragraphs: [
        'As AI regulation has firmed up, organisations need people who can document what a system does, assess its risks and produce evidence an auditor accepts. This is closer to GRC than to engineering, and it is hiring steadily in regulated sectors.',
        'It suits people with audit, risk or compliance backgrounds who have learned enough about model behaviour to ask useful questions. Deep engineering is not required; the ability to write precisely and hold a position under pressure is.',
        'The demand here is less cyclical than the engineering roles, because it is driven by obligation rather than by product ambition. Where a regulator requires documented assessment, that work happens regardless of whether the AI programme is going well.',
      ],
    },
    {
      heading: 'What the pay actually looks like',
      paragraphs: [
        'Treat any specific figure sceptically — the sample is small and the titles are inconsistent. The pattern that holds is that AI security roles sit at or slightly above equivalent-seniority application security roles at the same company, and the premium comes from scarcity rather than from the work being harder.',
        'That premium will compress as supply catches up, which argues for entering on genuine capability rather than on title arbitrage. The durable position is being a strong security engineer who also understands these systems, not someone whose only asset is being early.',
        'Sector matters more than the AI label. Finance, healthcare and defence pay a premium for security work generally, and that differential is larger than the difference between an AI security role and a conventional one at the same employer.',
      ],
    },
    {
      heading: 'The reality of the day-to-day',
      paragraphs: [
        'Worth setting expectations: a large share of this work is not adversarial testing. It is reviewing designs before they are built, arguing for narrower tool permissions, and explaining to a product team why the mitigation they proposed is a prompt instruction rather than a control.',
        'The genuinely adversarial portion is smaller and concentrated in specific weeks. Most of the time you are the person asking what happens if this document contains instructions, and being the only one in the room who thinks that question is urgent.',
        'That makes communication a larger part of the job than the title suggests. A finding nobody acts on has no value, and in a field where most engineers have not yet internalised the threat model, the persuading is frequently harder than the finding.',
      ],
    },
    {
      heading: 'How to enter from where you are',
      paragraphs: [
        'From security, you already have the mental model; add hands-on familiarity with how these systems are built. From engineering, you have the build knowledge; add structured threat modelling and the habit of thinking about misuse rather than use.',
        'Either way the evidence that travels is a written finding: a system you tested, what you found, why it mattered, what you recommended. One clear write-up outperforms a list of courses on a CV.',
        'The fastest internal route is to become the person who reviews AI features at your current employer. Almost every organisation is shipping something and almost none has assigned anyone to look at it, so the role frequently exists before anyone has written a job description for it.',
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
    {
      q: 'How much of the job is actually red teaming?',
      a: 'Less than the title suggests. Most of it is design review, arguing for narrower permissions, and explaining why a proposed mitigation is an instruction rather than a control.',
    },
    {
      q: 'What is the fastest way in from my current job?',
      a: 'Become the person who reviews AI features where you already work. Most organisations are shipping something and few have assigned anyone to look at it, so the role often exists before the job description does.',
    },
  ],
  related: ['how-to-become-an-ai-security-engineer', 'ai-governance-jobs', 'what-is-prompt-injection'],
  references: [
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'The standard categorisation of LLM-specific risks, including prompt injection.',
    },
    {
      title: 'OWASP Top Ten',
      url: 'https://owasp.org/www-project-top-ten/',
      publisher: 'OWASP',
      note: 'The baseline application security risks every engineer is expected to know.',
    },
  ],
};

export default post;

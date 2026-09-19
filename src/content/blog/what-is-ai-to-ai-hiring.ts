import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-ai-to-ai-hiring',
  tint: 'rose',
  title: 'What Is AI-to-AI Hiring?',
  heading: 'AI-to-AI hiring',
  description:
    'What happens when candidates and employers both automate: the arms race, why volume stops signalling anything, and which signals survive it.',
  keywords: [
    'ai to ai hiring',
    'ai screening ai applications',
    'automated hiring arms race',
    'ats vs ai applications',
    'ai recruiting future',
    'hiring automation both sides',
    'ai generated applications screening',
    'future of recruitment',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI & Hiring',
  excerpt:
    'Candidates automate applying, employers automate screening, and the equilibrium is worse for everyone except the people selling the tools.',
  sections: [
    {
      heading: 'How both sides ended up automated',
      paragraphs: [
        'Employers automated first, out of necessity: applicant tracking systems existed because a popular role attracted more applications than anyone could read. Candidates then automated in response, because a system that filters on keywords can be satisfied by supplying keywords.',
        'Each side’s automation is a rational response to the other’s. That is what makes it an arms race rather than a problem one side can fix.',
      ],
    },
    {
      heading: 'The equilibrium is worse for everyone',
      paragraphs: [
        'When applying costs almost nothing, application volume rises sharply. Employers respond by filtering harder, which makes each individual application less likely to be read, which makes candidates send more. The loop is self-reinforcing.',
        'Neither side ends up better off. Candidates spend the same effort for a lower response rate; employers receive more applications containing less signal. The only reliable beneficiaries are the vendors on both sides.',
      ],
    },
    {
      heading: 'Why volume stops signalling anything',
      paragraphs: [
        'An application used to carry weak evidence of genuine interest, because writing it cost something. Once that cost approaches zero the evidence disappears, and employers stop treating the application itself as information.',
        'What follows is predictable: they weight the signals that still cost something. Referrals, demonstrated work, prior relationships, anything verifiable outside the application. This is already visible in how many roles are filled before they are meaningfully advertised.',
      ],
      bullets: [
        'Referrals — expensive to fake because someone stakes their reputation',
        'Public work — a repository, writing, a talk, a shipped thing',
        'Specificity that only comes from real research about the company',
        'Prior contact with someone in the organisation',
      ],
    },
    {
      heading: 'Where it leaves candidates',
      paragraphs: [
        'The practical implication is uncomfortable but clear: competing on volume is competing in the dimension that has been devalued. Sending four hundred automated applications is optimising for a signal employers have already learned to discount.',
        'The better response is to use automation for the logistics and spend the recovered time on the expensive signals. Fewer applications, each with a genuine reason attached, plus deliberate effort on referrals and visible work.',
      ],
    },
    {
      heading: 'Where it leaves employers',
      paragraphs: [
        'Screening harder on the same signals does not work, because those signals are exactly what candidate automation produces well. Keyword matching in particular is now close to meaningless as a filter.',
        'The employers adapting best are shortening the top of the funnel — smaller application forms, more weight on a short work sample, earlier human contact. It costs more per candidate and it is the only approach that recovers the signal automation removed.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is AI-to-AI hiring?',
      a: 'Candidates using AI to generate and submit applications while employers use AI to screen them — an arms race where each side’s automation is a rational response to the other’s.',
    },
    {
      q: 'Why does application volume stop working?',
      a: 'An application used to signal genuine interest because writing it cost something. Once that cost is near zero the signal disappears, and employers shift weight to things that still cost something.',
    },
    {
      q: 'What still signals genuine interest?',
      a: 'Referrals, public work, verifiable specifics about the company, and prior contact with someone there. All are expensive to produce at volume, which is precisely why they still carry weight.',
    },
    {
      q: 'How should employers respond?',
      a: 'Not by screening harder on the same signals — those are what candidate automation produces best. Shorter forms, a small work sample and earlier human contact recover the signal automation removed.',
    },
  ],
  related: ['how-companies-use-ai-in-hiring', 'ai-agents-vs-recruiters', 'will-recruiters-use-ai-to-interview-ai-agents'],
};

export default post;

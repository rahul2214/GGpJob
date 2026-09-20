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
  anchors: ['AI-to-AI hiring', 'hiring arms race'],
  excerpt:
    'Candidates automate applying, employers automate screening, and the equilibrium is worse for everyone except the people selling the tools.',
  keyTakeaways: [
    'Each side automated as a rational response to the other, which is what makes it an arms race.',
    'The loop is self-reinforcing: harder filtering makes candidates send more, which justifies harder filtering.',
    'An application used to cost something, and that cost was the signal. It has gone.',
    'What survives is what is expensive to fake — referrals, public work, verifiable specifics.',
    'Employers adapting best are shortening the funnel rather than screening harder on the same signals.',
  ],
  sections: [
    {
      heading: 'How both sides ended up automated',
      paragraphs: [
        'Employers automated first, out of necessity: applicant tracking systems existed because a popular role attracted more applications than anyone could read. Candidates then automated in response, because a system that filters on keywords can be satisfied by supplying keywords.',
        'Each side’s automation is a rational response to the other’s. That is what makes it an arms race rather than a problem one side can fix.',
        'Nobody in the loop is behaving unreasonably, which is the uncomfortable part. A candidate sending more applications is responding correctly to a lower response rate, and an employer filtering harder is responding correctly to more applications — and both make the system worse.',
      ],
    },
    {
      heading: 'The equilibrium is worse for everyone',
      paragraphs: [
        'When applying costs almost nothing, application volume rises sharply. Employers respond by filtering harder, which makes each individual application less likely to be read, which makes candidates send more. The loop is self-reinforcing.',
        'Neither side ends up better off. Candidates spend the same effort for a lower response rate; employers receive more applications containing less signal. The only reliable beneficiaries are the vendors on both sides.',
        'It is a straightforward collective action problem. Everyone would be better off if applications were fewer and more considered, and no individual candidate benefits from unilaterally sending fewer — which is exactly why it does not resolve on its own.',
      ],
      table: {
        caption: 'The loop, step by step',
        columns: ['Step', 'Who acts', 'Consequence'],
        rows: [
          ['Volume rises', 'Candidates', 'Employers cannot read everything'],
          ['Screening automated', 'Employers', 'Keywords become the filter'],
          ['Applications optimised', 'Candidates', 'Keywords stop distinguishing'],
          ['Filtering tightened', 'Employers', 'Response rate falls'],
          ['More applications sent', 'Candidates', 'Volume rises again'],
        ],
      },
    },
    {
      heading: 'Why volume stops signalling anything',
      paragraphs: [
        'An application used to carry weak evidence of genuine interest, because writing it cost something. Once that cost approaches zero the evidence disappears, and employers stop treating the application itself as information.',
        'What follows is predictable: they weight the signals that still cost something. Referrals, demonstrated work, prior relationships, anything verifiable outside the application. This is already visible in how many roles are filled before they are meaningfully advertised.',
        'This is a general property of signalling rather than anything specific to hiring. A signal works because it is costly to produce for people who lack the underlying quality, and anything that makes it cheap for everyone destroys it — which is why the response is always to find a new costly signal rather than to improve the old one.',
      ],
      bullets: [
        'Referrals — expensive to fake because someone stakes their reputation',
        'Public work — a repository, writing, a talk, a shipped thing',
        'Specificity that only comes from real research about the company',
        'Prior contact with someone in the organisation',
      ],
    },
    {
      heading: 'Who this hurts most',
      paragraphs: [
        'It is worth saying plainly that the shift towards referrals and networks is not neutral. Those are precisely the resources that are unevenly distributed, and a hiring market that weights them more heavily advantages people who already have access.',
        'Career changers, people without industry contacts, those returning after a break and anyone geographically distant from the employer all lose the most when the open application stops working. The cold application was an imperfect channel and it was the one available to everyone.',
        'For candidates in that position the practical response is to build the substitute deliberately rather than hoping the channel recovers. Public work substitutes reasonably well for a network, because it is verifiable by a stranger and does not require knowing anyone first.',
      ],
    },
    {
      heading: 'Where it leaves candidates',
      paragraphs: [
        'The practical implication is uncomfortable but clear: competing on volume is competing in the dimension that has been devalued. Sending four hundred automated applications is optimising for a signal employers have already learned to discount.',
        'The better response is to use automation for the logistics and spend the recovered time on the expensive signals. Fewer applications, each with a genuine reason attached, plus deliberate effort on referrals and visible work.',
        'One specific, cheap move outperforms most others: a short message to someone who actually works on the team, sent alongside the application. It costs ten minutes, it is not automatable at volume, and it converts at a rate that makes the arithmetic on mass applications look absurd.',
      ],
    },
    {
      heading: 'Where it leaves employers',
      paragraphs: [
        'Screening harder on the same signals does not work, because those signals are exactly what candidate automation produces well. Keyword matching in particular is now close to meaningless as a filter.',
        'The employers adapting best are shortening the top of the funnel — smaller application forms, more weight on a short work sample, earlier human contact. It costs more per candidate and it is the only approach that recovers the signal automation removed.',
        'The counter-intuitive move some are making is reducing what they ask for. A very short application raises volume further and makes the sample the real filter, which is cheaper to evaluate at scale than a long document nobody trusts and produces a signal candidate automation cannot fake.',
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
    {
      q: 'Who is disadvantaged by the shift to referrals?',
      a: 'Career changers, people without industry contacts, returners and anyone geographically distant. The cold application was imperfect and it was the channel available to everyone.',
    },
    {
      q: 'What is the highest-return move for a candidate now?',
      a: 'A short message to someone who actually works on the team, sent alongside the application. Ten minutes, not automatable at volume, and it converts far better than the marginal fiftieth application.',
    },
  ],
  related: ['how-companies-use-ai-in-hiring', 'ai-agents-vs-recruiters', 'will-recruiters-use-ai-to-interview-ai-agents'],
};

export default post;

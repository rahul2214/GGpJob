import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-resume-keyword-optimizer',
  tint: 'emerald',
  title: 'How to Build an AI Resume Keyword Optimizer',
  heading: 'Keyword optimisation, done responsibly',
  description:
    'Building a keyword tool that helps rather than harms: extracting real requirements, distinguishing missing from unstated, and refusing to invent experience.',
  keywords: [
    'resume keyword optimizer',
    'ats keyword matching',
    'keyword extraction job description',
    'resume optimisation tool',
    'keyword stuffing',
    'skill synonyms',
    'resume rewriting ai',
    'honest resume tool',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Resumes & ATS',
  excerpt:
    'The line that decides whether this tool is useful or harmful: surfacing a term the candidate earned, versus suggesting one they did not.',
  sections: [
    {
      heading: 'Extract requirements, not frequent words',
      paragraphs: [
        'Term-frequency approaches surface the words a posting repeats, which are often the company boilerplate — "collaborative", "fast-paced", "passionate". Those are not requirements and putting them in a CV helps nobody.',
        'Extract the things a person must be able to do: technologies, methods, domains, qualifications, scale. A model does this well when asked for requirements specifically, and badly when asked for keywords.',
      ],
    },
    {
      heading: 'Separate the three cases',
      paragraphs: [
        'A term absent from a CV means one of three quite different things, and conflating them is what makes these tools dangerous. Either the candidate has the experience and did not mention it, or they have equivalent experience under a different name, or they do not have it.',
        'The first is a genuine improvement. The second is a wording fix. The third is not a CV problem at all, and any suggestion to add the term is a suggestion to lie.',
      ],
      bullets: [
        'Has it, did not mention it — add, with the specific evidence',
        'Has an equivalent — surface both terms in the same phrase',
        'Does not have it — report as a gap, never as a suggested edit',
      ],
    },
    {
      heading: 'Handle synonyms in both directions',
      paragraphs: [
        'Someone who wrote "built data pipelines" has ETL experience, and a posting asking for ETL will not match them lexically. The tool should recognise the equivalence and suggest phrasing that carries both, not replace their honest description with jargon.',
        '"Built and operated ETL data pipelines" is both true and matchable. That is the shape of a good suggestion: additive, accurate, and serving lexical and semantic matching at once.',
      ],
    },
    {
      heading: 'Never suggest text that is not true',
      paragraphs: [
        'This is the hard constraint that determines whether you have built a helpful product or an embarrassment generator. A tool that suggests adding a technology the candidate has never used is setting them up to be found out in the first technical conversation.',
        'Enforce it structurally: every suggestion must point to specific evidence in the existing CV. If there is no evidence, the tool reports a gap and stops. Prompting a model to "be honest" is not enough — require the citation.',
      ],
    },
    {
      heading: 'Cap the suggestions',
      paragraphs: [
        'A tool that returns thirty keywords invites stuffing, and a CV visibly written for a parser reads badly to the human who ultimately decides. Recruiters notice a skills list containing every term from their own posting.',
        'Return the handful that matter most, ordered by how central they are to the role. Fewer, better suggestions produce a CV that passes screening and still reads like a person wrote it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should a keyword tool extract frequent words from a posting?',
      a: 'No — that surfaces boilerplate like "collaborative" and "fast-paced". Extract requirements: technologies, methods, domains, qualifications and scale.',
    },
    {
      q: 'What if the candidate lacks a required keyword?',
      a: 'Report it as a gap and never as a suggested edit. Suggesting they add a technology they have not used sets them up to be found out in the first technical conversation.',
    },
    {
      q: 'How should synonyms be handled?',
      a: 'Additively. Someone who "built data pipelines" has ETL experience, so suggest phrasing carrying both terms rather than replacing their honest description with jargon.',
    },
    {
      q: 'How many keyword suggestions should the tool return?',
      a: 'A handful, ordered by centrality to the role. Thirty invites stuffing, and a skills list echoing the whole posting reads badly to the human who decides.',
    },
  ],
  related: ['how-to-build-an-ai-ats-resume-scorer', 'how-to-extract-skills-from-a-job-description', 'how-to-build-an-ai-resume-tailoring-system'],
};

export default post;

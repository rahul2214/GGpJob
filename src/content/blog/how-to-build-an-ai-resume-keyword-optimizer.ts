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
  anchors: ['keyword stuffing', 'resume keyword optimizer'],
  excerpt:
    'The line that decides whether this tool is useful or harmful: surfacing a term the candidate earned, versus suggesting one they did not.',
  keyTakeaways: [
    'Extract requirements, not frequent words — boilerplate is what term frequency surfaces.',
    'A missing term means one of three different things, and conflating them is the danger.',
    'Handle synonyms additively so the phrasing stays true and becomes matchable.',
    'Require a citation for every suggestion; "be honest" in a prompt is not a control.',
    'Cap the suggestions, because a CV written for a parser reads badly to the person deciding.',
  ],
  sections: [
    {
      heading: 'Extract requirements, not frequent words',
      paragraphs: [
        'Term-frequency approaches surface the words a posting repeats, which are often the company boilerplate — "collaborative", "fast-paced", "passionate". Those are not requirements and putting them in a CV helps nobody.',
        'Extract the things a person must be able to do: technologies, methods, domains, qualifications, scale. A model does this well when asked for requirements specifically, and badly when asked for keywords.',
        'Weight what you extract by how it was stated. A term in the job title or repeated through the responsibilities matters; one item in a bulleted list of twelve under a heading nobody wrote carefully does not, and treating them equally produces a long flat list of equal-looking suggestions.',
      ],
    },
    {
      heading: 'Separate the three cases',
      paragraphs: [
        'A term absent from a CV means one of three quite different things, and conflating them is what makes these tools dangerous. Either the candidate has the experience and did not mention it, or they have equivalent experience under a different name, or they do not have it.',
        'The first is a genuine improvement. The second is a wording fix. The third is not a CV problem at all, and any suggestion to add the term is a suggestion to lie.',
        'Since the document alone cannot distinguish the first case from the third, ask. "This posting asks for X and your CV does not show it — have you used it?" costs one tap and converts a large share of apparent gaps into accurate additions.',
      ],
      bullets: [
        'Has it, did not mention it — add, with the specific evidence',
        'Has an equivalent — surface both terms in the same phrase',
        'Does not have it — report as a gap, never as a suggested edit',
      ],
      table: {
        caption: 'What the tool should do with a missing term',
        columns: ['Case', 'Action', 'Never'],
        rows: [
          ['Has it, unmentioned', 'Add with evidence', 'Add without asking'],
          ['Equivalent experience', 'Phrase carrying both terms', 'Replace their wording'],
          ['Genuinely absent', 'Report as a gap', 'Suggest the edit'],
          ['Boilerplate adjective', 'Ignore', 'Suggest at all'],
          ['Required certification', 'Report, unambiguously', 'Imply it can be written in'],
        ],
      },
    },
    {
      heading: 'Handle synonyms in both directions',
      paragraphs: [
        'Someone who wrote "built data pipelines" has ETL experience, and a posting asking for ETL will not match them lexically. The tool should recognise the equivalence and suggest phrasing that carries both, not replace their honest description with jargon.',
        '"Built and operated ETL data pipelines" is both true and matchable. That is the shape of a good suggestion: additive, accurate, and serving lexical and semantic matching at once.',
        'Be careful which direction the equivalence runs. "Built data pipelines" supports ETL; ETL experience does not necessarily support "built distributed systems", and a synonym table applied symmetrically will eventually produce a claim the candidate cannot defend.',
      ],
    },
    {
      heading: 'Never suggest text that is not true',
      paragraphs: [
        'This is the hard constraint that determines whether you have built a helpful product or an embarrassment generator. A tool that suggests adding a technology the candidate has never used is setting them up to be found out in the first technical conversation.',
        'Enforce it structurally: every suggestion must point to specific evidence in the existing CV. If there is no evidence, the tool reports a gap and stops. Prompting a model to "be honest" is not enough — require the citation.',
        'Watch for inflation as well as invention, because it introduces no new term and changes the claim. "Contributed to" becoming "led", or "used" becoming "owned", passes a naive check and fails the interview, so the comparison has to cover strength and not only content.',
      ],
    },
    {
      heading: 'Where the term goes matters',
      paragraphs: [
        'A skill in a bare list at the bottom of a CV is worth much less to a human reader than the same skill inside an achievement that shows what was done with it. The parser sees both; the person deciding does not treat them the same way.',
        'So the better suggestion names the bullet to change rather than the list to extend. "Add Kubernetes to your skills list" is a parser optimisation; "your migration bullet used Kubernetes — say so" improves the document for both audiences at once.',
        'Recency and duration carry weight that a keyword match discards entirely. A skill used last year and a skill touched once four years ago are very different claims, and phrasing that carries the timeframe is more honest and, in front of a human, more persuasive.',
      ],
    },
    {
      heading: 'Cap the suggestions',
      paragraphs: [
        'A tool that returns thirty keywords invites stuffing, and a CV visibly written for a parser reads badly to the human who ultimately decides. Recruiters notice a skills list containing every term from their own posting.',
        'Return the handful that matter most, ordered by how central they are to the role. Fewer, better suggestions produce a CV that passes screening and still reads like a person wrote it.',
        'Remember which stage this is optimising. Keyword coverage affects a first-pass screen and nothing after it, so a document that clears that gate and then reads as machine-written has won the cheap stage and lost the one that decides.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should a keyword tool extract frequent words from a posting?',
      a: 'No — that surfaces boilerplate like "collaborative" and "fast-paced". Extract requirements: technologies, methods, domains, qualifications and scale, weighted by how they were stated.',
    },
    {
      q: 'What if the candidate lacks a required keyword?',
      a: 'Report it as a gap and never as a suggested edit. Suggesting they add a technology they have not used sets them up to be found out in the first technical conversation.',
    },
    {
      q: 'How should synonyms be handled?',
      a: 'Additively, and asymmetrically. "Built data pipelines" supports ETL; ETL does not support "built distributed systems", and a symmetric table eventually produces an indefensible claim.',
    },
    {
      q: 'How many keyword suggestions should the tool return?',
      a: 'A handful, ordered by centrality to the role. Thirty invites stuffing, and a skills list echoing the whole posting reads badly to the human who decides.',
    },
    {
      q: 'Where should a keyword actually go?',
      a: 'Inside an achievement that shows what was done with it, not appended to a list. Name the bullet to change rather than the list to extend.',
    },
    {
      q: 'Does a claim check catch everything?',
      a: 'No. Inflation — "contributed to" becoming "led" — adds no new term and changes the claim, so the comparison has to cover strength as well as content.',
    },
  ],
  related: ['how-to-build-an-ai-ats-resume-scorer', 'how-to-extract-skills-from-a-job-description', 'how-to-build-an-ai-resume-tailoring-system'],
};

export default post;

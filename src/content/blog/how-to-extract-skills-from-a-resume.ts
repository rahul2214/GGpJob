import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-extract-skills-from-a-resume',
  tint: 'emerald',
  title: 'How to Extract Skills From a Resume Using AI',
  heading: 'Extracting skills from a CV',
  description:
    'Pulling skills from a CV reliably: the skills section trap, inferring from experience, normalising to a taxonomy, and estimating depth rather than presence.',
  keywords: [
    'extract skills from resume',
    'resume skill extraction ai',
    'skills taxonomy normalisation',
    'cv skills parsing',
    'implicit skills inference',
    'skill depth estimation',
    'resume nlp skills',
    'candidate skill profile',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'The skills section is the least reliable part of a CV. The real evidence is in the experience bullets, and extracting it is a different job.',
  sections: [
    {
      heading: 'Do not trust the skills section',
      paragraphs: [
        'The listed skills section is self-reported, unverified and frequently padded — partly because candidates know screening systems read it. It tells you what someone wants to be matched against, not what they have done.',
        'Reading only that section produces a profile where a week of tutorials and six years of production use look identical. Every matching system built on it inherits that flaw and produces confident nonsense.',
      ],
    },
    {
      heading: 'Infer from experience instead',
      paragraphs: [
        'The evidence lives in the bullets: "built and operated the ingestion pipeline processing two million events daily" implies data engineering, streaming, monitoring and scale — none of which may appear in the skills list.',
        'So extract in two passes. Take the declared list, then separately extract skills implied by each role, and keep the two distinguishable. A skill supported by described work is worth much more than one that only appears in a list, and downstream scoring should be able to tell them apart.',
      ],
      bullets: [
        'Declared — listed in a skills section, unverified',
        'Evidenced — implied by described work, with the role attached',
        'Recency — when was it last used, derived from the role dates',
        'Duration — across how long, aggregated over roles',
      ],
    },
    {
      heading: 'Normalise to a taxonomy',
      paragraphs: [
        'Raw extraction gives you "React", "React.js", "ReactJS", "React 18" and "react hooks" as five distinct skills. Matching on raw strings therefore fails constantly in both directions.',
        'Map to a canonical taxonomy with aliases. Build it from what you actually see rather than importing an exhaustive ontology you will spend months curating — the long tail matters much less than getting the common hundred right.',
      ],
    },
    {
      heading: 'Estimate depth, not just presence',
      paragraphs: [
        'A binary has-or-has-not is far less useful than a sense of depth. Someone who used a technology in one project three years ago and someone who has built on it daily for five years should not score identically.',
        'Approximate depth from what the CV supports: how long, how recently, how central to the role, and whether the described work implies ownership rather than exposure. State it as an estimate with its evidence, because it is an inference and should be correctable.',
      ],
    },
    {
      heading: 'Avoid the invention failure',
      paragraphs: [
        'Asked to extract skills, a model will happily add ones that a person with that background probably has. A backend engineer gets Docker whether or not it is mentioned anywhere.',
        'Require a span of source text for each extracted skill. If the model cannot point at where it came from, it did not come from the CV. This single constraint eliminates most of the plausible-but-unsupported additions that make a profile subtly wrong.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why not just read the skills section of a CV?',
      a: 'It is self-reported and often padded, so a week of tutorials and six years of production use look identical. The real evidence is in the experience bullets describing what the person actually did.',
    },
    {
      q: 'How do I handle the same skill written many ways?',
      a: 'Normalise to a canonical taxonomy with aliases, built from what you actually encounter. Getting the common hundred right matters far more than curating an exhaustive ontology.',
    },
    {
      q: 'Should skills be binary?',
      a: 'No. Estimate depth from duration, recency, centrality to the role and whether the work implies ownership. Present it as an inference with its evidence so it can be corrected.',
    },
    {
      q: 'How do I stop the model inventing skills?',
      a: 'Require a span of source text for every extracted skill. If it cannot point at where the skill came from, it was not in the CV — this eliminates most plausible-but-unsupported additions.',
    },
  ],
  related: ['how-to-build-an-ai-resume-parser', 'how-to-extract-skills-from-a-job-description', 'how-to-calculate-resume-to-job-match-score'],
};

export default post;

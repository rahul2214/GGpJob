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
  anchors: ['skills from a resume', 'declared versus evidenced'],
  excerpt:
    'The skills section is the least reliable part of a CV. The real evidence is in the experience bullets, and extracting it is a different job.',
  keyTakeaways: [
    'The skills list says what someone wants to be matched against, not what they have done.',
    'Extract declared and evidenced skills separately and keep them distinguishable.',
    'Normalise to a taxonomy built from what you actually see, not an exhaustive ontology.',
    'Estimate depth from duration, recency and ownership rather than recording presence.',
    'Require a source span for every extracted skill, or the model will supply plausible ones.',
  ],
  sections: [
    {
      heading: 'Do not trust the skills section',
      paragraphs: [
        'The listed skills section is self-reported, unverified and frequently padded — partly because candidates know screening systems read it. It tells you what someone wants to be matched against, not what they have done.',
        'Reading only that section produces a profile where a week of tutorials and six years of production use look identical. Every matching system built on it inherits that flaw and produces confident nonsense.',
        'Do not discard it either. An absence from the list where the experience clearly evidences the skill is itself informative — it usually means the candidate undersold something, which is a correction worth offering them.',
      ],
    },
    {
      heading: 'Infer from experience instead',
      paragraphs: [
        'The evidence lives in the bullets: "built and operated the ingestion pipeline processing two million events daily" implies data engineering, streaming, monitoring and scale — none of which may appear in the skills list.',
        'So extract in two passes. Take the declared list, then separately extract skills implied by each role, and keep the two distinguishable. A skill supported by described work is worth much more than one that only appears in a list, and downstream scoring should be able to tell them apart.',
        'Attach each evidenced skill to the role it came from. That is what makes an explanation possible later — "matched on your work at X" is only available if the extraction recorded where the evidence was, and a flat skill list discards it permanently.',
      ],
      bullets: [
        'Declared — listed in a skills section, unverified',
        'Evidenced — implied by described work, with the role attached',
        'Recency — when was it last used, derived from the role dates',
        'Duration — across how long, aggregated over roles',
      ],
      table: {
        caption: 'What each source of a skill is worth',
        columns: ['Source', 'Confidence', 'Use for'],
        rows: [
          ['Named in an achievement with detail', 'High', 'Matching and explanation'],
          ['Named in a role description', 'Moderate', 'Matching'],
          ['In the skills list only', 'Low', 'Recall, not evidence'],
          ['Implied by the work, unnamed', 'Moderate, mark inferred', 'Surface for confirmation'],
          ['Inferred from the job title', 'None', 'Do not store'],
        ],
      },
    },
    {
      heading: 'Normalise to a taxonomy',
      paragraphs: [
        'Raw extraction gives you "React", "React.js", "ReactJS", "React 18" and "react hooks" as five distinct skills. Matching on raw strings therefore fails constantly in both directions.',
        'Map to a canonical taxonomy with aliases. Build it from what you actually see rather than importing an exhaustive ontology you will spend months curating — the long tail matters much less than getting the common hundred right.',
        'Use the same taxonomy on the posting side. Requirements and candidate skills normalised into different vocabularies means matching compares incompatible things and silently under-reports, which is a bug nobody notices because nothing fails.',
        'Keep the original string alongside the canonical one. Normalisation is lossy, and "React 18" carries recency information that "React" does not — plus an explanation quoting the candidate’s own words is more convincing than one written in your internal vocabulary.',
      ],
    },
    {
      heading: 'Estimate depth, not just presence',
      paragraphs: [
        'A binary has-or-has-not is far less useful than a sense of depth. Someone who used a technology in one project three years ago and someone who has built on it daily for five years should not score identically.',
        'Approximate depth from what the CV supports: how long, how recently, how central to the role, and whether the described work implies ownership rather than exposure. State it as an estimate with its evidence, because it is an inference and should be correctable.',
        'Recency deserves particular weight in fast-moving areas. A framework used daily until last year and one touched briefly five years ago are very different claims, and a depth estimate that ignores when the work happened will overstate the second.',
      ],
    },
    {
      heading: 'Avoid the invention failure',
      paragraphs: [
        'Asked to extract skills, a model will happily add ones that a person with that background probably has. A backend engineer gets Docker whether or not it is mentioned anywhere.',
        'Require a span of source text for each extracted skill. If the model cannot point at where it came from, it did not come from the CV. This single constraint eliminates most of the plausible-but-unsupported additions that make a profile subtly wrong.',
        'Handle the genuinely implied case explicitly rather than banning inference outright. Someone who "operated a production Kubernetes cluster" almost certainly has container experience, and the honest treatment is to surface that as a suggestion for the candidate to confirm rather than either discarding it or storing it as fact.',
      ],
    },
    {
      heading: 'Let the candidate correct it',
      paragraphs: [
        'No extraction is accurate enough to be the last word on someone’s own experience. Show what was found, separated into declared and evidenced, and make every entry editable.',
        'Corrections are the best evaluation data available. A skill candidates repeatedly add by hand is one your extraction misses systematically, and a skill they repeatedly remove is one you are inferring too eagerly — both far more useful than an accuracy number on a sample you assembled.',
        'Mark provenance so a correction sticks. A skill the candidate removed must not reappear the next time their CV is re-parsed, and knowing which entries a person set is the only thing that prevents it.',
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
      a: 'Normalise to a canonical taxonomy with aliases, built from what you actually encounter, and use the same taxonomy on the posting side so both are comparable.',
    },
    {
      q: 'Should skills be binary?',
      a: 'No. Estimate depth from duration, recency, centrality to the role and whether the work implies ownership. Present it as an inference with its evidence so it can be corrected.',
    },
    {
      q: 'How do I stop the model inventing skills?',
      a: 'Require a span of source text for every extracted skill. If it cannot point at where the skill came from, it was not in the CV.',
    },
    {
      q: 'What about skills that are genuinely implied?',
      a: 'Surface them as suggestions for the candidate to confirm rather than storing them as fact — someone operating a production cluster almost certainly has container experience.',
    },
    {
      q: 'Why attach evidenced skills to specific roles?',
      a: 'Because that is what makes "matched on your work at X" possible later. A flat skill list discards the provenance permanently.',
    },
  ],
  related: ['how-to-build-an-ai-resume-parser', 'how-to-extract-skills-from-a-job-description', 'how-to-calculate-resume-to-job-match-score'],
};

export default post;

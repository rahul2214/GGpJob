import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-resume-tailoring-agent',
  tint: 'emerald',
  title: 'How to Build an AI Resume Tailoring Agent',
  heading: 'A tailoring agent, end to end',
  description:
    'What makes a tailoring agent different from a one-shot generator: reading the posting, deciding what to change, verification, and learning from outcomes.',
  keywords: [
    'resume tailoring agent',
    'ai resume agent',
    'requirement extraction',
    'tailoring decisions',
    'claim verification',
    'resume agent feedback',
    'automated cv tailoring',
    'tailoring pipeline',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Resumes & ATS',
  anchors: ['tailoring agent', 'decide before generating'],
  excerpt:
    'An agent differs from a generator in that it decides what to change before changing anything — and can conclude that the answer is nothing.',
  keyTakeaways: [
    'Extract what the role requires before touching the document.',
    'The plan is the distinguishing step, and a bad plan is far cheaper to catch than a bad document.',
    'With the plan fixed, generation becomes phrasing rather than invention.',
    'Report the gaps the CV cannot close — often more useful than the document itself.',
    'Outcome data is sparse and confounded; enough to notice a pattern, not to tune on.',
  ],
  sections: [
    {
      heading: 'Read the posting properly first',
      paragraphs: [
        'Tailoring against a posting nobody analysed produces generic changes. The agent’s first step is extracting what the role actually requires: hard requirements, preferred ones, the seniority implied, the domain context.',
        'Separate the requirements from the noise. Most postings contain a substantial amount of company description and benefits language that has no bearing on what the CV should say.',
        'Weight what comes out rather than producing a flat list. A skill named in the job title and repeated through the responsibilities should dominate the plan; one item among twelve nice-to-haves should barely register, and treating them equally is how tailoring leads with the wrong thing.',
      ],
    },
    {
      heading: 'Decide before generating',
      paragraphs: [
        'The distinguishing step is a plan: which achievements to surface, which to cut, how to reorder, what the summary should emphasise. Produced as structured decisions, not as prose.',
        'This is inspectable and testable in a way a generated document is not. You can check whether the plan makes sense before any text is written, and a bad plan is much cheaper to catch than a bad document.',
        'It also makes failures diagnosable. When a variant emphasises the wrong experience you can see immediately whether selection chose badly or phrasing let it down, and those have entirely different fixes.',
      ],
      bullets: [
        'Extracted requirements, weighted',
        'Achievement relevance scores against them',
        'Selection and ordering decisions with reasons',
        'A list of gaps the CV cannot close',
      ],
      table: {
        caption: 'Who does what in the pipeline',
        columns: ['Step', 'Mechanism', 'Why not the model'],
        rows: [
          ['Extract requirements', 'Model', 'Genuine language work'],
          ['Score achievements', 'Deterministic', 'Inspectable and cheap'],
          ['Select and order', 'Deterministic', 'Must be explainable'],
          ['Phrase the selected items', 'Model', 'This is what it is for'],
          ['Insert dates, titles, figures', 'Copied', 'Never let it write a fact'],
          ['Verify claims', 'Deterministic', 'A model checking itself agrees'],
        ],
      },
    },
    {
      heading: 'Generate only within the plan',
      paragraphs: [
        'With the plan fixed, generation becomes phrasing rather than invention. The model rewrites selected achievements to emphasise what this role cares about, using facts that are already in the structured record.',
        'Constrain it to that record and verify afterwards. Every generated line should trace to a stored fact, and anything that does not is removed rather than reworded.',
        'Never let it produce a date, a title or a figure. Those are copied from the record, because a model that never writes a fact cannot get one wrong — a stronger guarantee than any instruction about accuracy.',
      ],
    },
    {
      heading: 'Verify strength, not only content',
      paragraphs: [
        'Claim checking catches invention and misses inflation, which is the more common failure in practice. "Contributed to" becoming "led", "used" becoming "owned", "helped migrate" becoming "drove the migration" — none introduces a new fact and each changes what the candidate is claiming.',
        'So the verification pass has to compare the strength of a generated line against its source, not merely confirm the subject matter matches. That is the difference between a check that passes everything and one that catches the sentence an interviewer will ask about.',
        'Cap how far emphasis can move as well. If a skill accounts for a small fraction of someone’s actual experience, it should not become the headline of their summary, and a ratio the system can measure enforces that without anyone having to notice.',
        'Show the candidate what changed rather than the finished document. A diff against their canonical material, with anything unverifiable flagged, is a ninety-second review that catches the line that drifted — where a clean page invites approval without reading.',
      ],
    },
    {
      heading: 'Report what could not be fixed',
      paragraphs: [
        'Some requirements cannot be satisfied by any amount of rewriting, and an agent that silently produces a document implying otherwise has misled its user.',
        'Surface the remaining gaps explicitly: this posting requires something your record does not show. That is more valuable than the tailored document itself, because it informs whether to apply at all.',
        'Phrase a gap as what the record does not evidence rather than what the person lacks, and ask. A large share of apparent gaps are things the candidate has and never wrote down, which turns the finding into a stronger application rather than a reason to stop.',
        'Let the honest output be no document. Where a posting requires something genuinely absent and central, saying so beats producing a tailored CV that gets someone into a room they are not ready for.',
      ],
    },
    {
      heading: 'Close the loop with outcomes',
      paragraphs: [
        'Store the exact document sent with each application. Over time, responses and rejections form the only real feedback this system will ever receive.',
        'Treat it cautiously — response data is sparse, delayed and confounded by everything else about the application. It is enough to notice a pattern worth investigating, not enough to tune on directly.',
        'Store the plan alongside the document, not just the file. Knowing which achievements were selected and in what order is what makes comparison across applications meaningful, and it costs a few fields recorded at generation time.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How is a tailoring agent different from a generator?',
      a: 'It plans before writing — which achievements to surface, cut and reorder, as structured decisions. A bad plan is far cheaper to catch than a bad document.',
    },
    {
      q: 'How do I stop tailored resumes inventing content?',
      a: 'Fix the plan first so generation is phrasing rather than invention, constrain it to the structured record, and never let the model produce a date, title or figure.',
    },
    {
      q: 'Should the agent report requirements it could not address?',
      a: 'Yes, explicitly — phrased as what the record does not evidence, with a question. A large share turn out to be things the candidate has and never wrote down.',
    },
    {
      q: 'Can the agent learn from application outcomes?',
      a: 'Cautiously. Response data is sparse, delayed and confounded — enough to notice a pattern worth investigating, not enough to tune on directly.',
    },
    {
      q: 'What does a claim check miss?',
      a: 'Inflation. "Contributed to" becoming "led" introduces no new fact and changes the claim, so verification has to compare strength as well as content.',
    },
    {
      q: 'Should the agent ever produce nothing?',
      a: 'Yes. Where a central requirement is genuinely absent, saying so beats a tailored CV that gets someone into a room they are not ready for.',
    },
  ],
  related: ['how-to-build-an-ai-resume-tailoring-system', 'how-to-automatically-rewrite-a-resume-for-every-job', 'how-to-reduce-hallucinations-in-ai-resume-generation'],
};

export default post;

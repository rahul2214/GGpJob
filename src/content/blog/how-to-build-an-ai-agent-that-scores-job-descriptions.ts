import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-scores-job-descriptions',
  tint: 'violet',
  title: 'How to Build an AI Agent That Reads Job Descriptions and Scores Jobs',
  heading: 'Scoring job descriptions',
  description:
    'How to turn a job description into a defensible score: separating extraction from judgement, handling inflated requirements, and calibrating against real decisions.',
  keywords: [
    'ai job scoring',
    'score job descriptions ai',
    'job relevance scoring',
    'job description parser ai',
    'automated job ranking',
    'job fit score',
    'llm job evaluation',
    'job matching score build',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['scores job descriptions', 'extraction and judgement'],
  excerpt:
    'Scoring is two jobs pretending to be one: understanding what the posting asks for, and judging whether it is worth this candidate’s time.',
  keyTakeaways: [
    'Separating extraction from judgement is what makes a wrong score diagnosable.',
    'Distinguish hard requirements from hopeful ones, or the scorer rejects roles the candidate would get.',
    'Score dimensions separately; a blended number hides an impossible location.',
    'Attach reasoning to every score — it is the debugging and the product feature at once.',
    'Calibrate against thirty to fifty real apply-or-skip decisions, and study the disagreements.',
  ],
  sections: [
    {
      heading: 'Separate extraction from judgement',
      paragraphs: [
        'The mistake that makes scoring undebuggable is doing both in one model call. When a score looks wrong you cannot tell whether the system misread the posting or misjudged the fit, and you end up tuning a prompt that was never the problem.',
        'Run extraction first and store its output. Then score from the structured result. Now a bad score has a diagnosable cause, and improving scoring does not mean re-paying for extraction on every iteration.',
        'The cost argument is as strong as the debugging one. Extraction is per posting and scoring is per candidate-posting pair, so a posting seen by four hundred candidates should be read once — and combining the two steps means reading it four hundred times.',
      ],
    },
    {
      heading: 'What to extract',
      paragraphs: [
        'Pull the posting into a comparable shape. The important distinction — and the one most implementations miss — is between what is genuinely required and what is listed hopefully.',
        'Job descriptions routinely ask for more than the role needs, because they are written defensively. A system that treats every listed technology as mandatory will reject roles the candidate would comfortably get, which is the most common way these tools become useless.',
        'Extract the requirement weight from how it is written rather than from where it sits on the page. "Must hold", a repetition through the responsibilities, and presence in the job title all signal a real requirement; a bulleted list of twelve technologies under a heading nobody wrote carefully does not.',
      ],
      bullets: [
        'Hard requirements versus stated preferences versus aspiration',
        'Seniority, inferred from responsibilities rather than the title alone',
        'Work model and location, including contradictions between them',
        'Compensation if stated, with its currency and period',
        'Signals about the team: size, reporting line, stage',
      ],
      table: {
        caption: 'Scoring by dimension rather than one number',
        columns: ['Dimension', 'Type', 'Effect of a poor result'],
        rows: [
          ['Eligibility', 'Gate', 'Excluded entirely'],
          ['Skills', 'Score', 'Lower ranking'],
          ['Seniority distance', 'Score, asymmetric', 'Lower, but a stretch is fine'],
          ['Domain', 'Score', 'Lower ranking'],
          ['Location and work model', 'Gate or score', 'Depends on stated flexibility'],
          ['Compensation', 'Gate if a floor is set', 'Excluded below the floor'],
        ],
      },
    },
    {
      heading: 'Score against a profile, not a keyword list',
      paragraphs: [
        'The naive comparison counts overlapping terms, which rewards padding and misses everything expressed differently. A candidate who has built data pipelines for six years does not match a posting that says "ETL" if you are matching strings.',
        'Compare meaning instead, and score dimensions separately rather than producing one number: skills, seniority, domain, location and compensation each get their own judgement. A single blended figure hides the fact that a role is a perfect skills match in an impossible location.',
        'Keep the gates out of the scoring entirely. Eligibility, a salary floor and a stated exclusion are checks that run before anything is scored, because the moment they become weights a confident skills match will eventually outvote them.',
      ],
    },
    {
      heading: 'Always attach the reasoning',
      paragraphs: [
        'A bare score is useless to everyone. The candidate cannot tell whether to trust it, you cannot debug it, and it produces no signal for improving the system.',
        'Require a short written justification naming the specific matches and the specific gaps. This costs a few tokens and changes the product: it lets a candidate overrule a judgement for a reason, and it lets you find out that the model has been marking down every role that says "fast-paced".',
        'Require the reasoning to cite the posting rather than paraphrase it. A justification that quotes the requirement it matched against can be checked; one that describes the fit in general terms is a summary of the score rather than an account of it.',
      ],
    },
    {
      heading: 'Keeping scores stable and comparable',
      paragraphs: [
        'Scores drift for reasons that have nothing to do with fit: a model update, a prompt change, a reworded posting. A candidate who saw a role at 82 yesterday and 71 today has no way to interpret either number, and the credibility of the whole feature depends on that not happening casually.',
        'Store the model version and prompt version with every score, and re-score deliberately rather than lazily. When the scoring changes materially, re-score the whole visible set at once so the candidate sees a consistent scale rather than a mixture of two.',
        'Consider whether a numeric score is the right output at all. Bands — strong, worth considering, a stretch, not a fit — are less precise and more honest, and they do not invite a candidate to treat the gap between 74 and 77 as meaningful when it is noise.',
      ],
    },
    {
      heading: 'Calibrate against real decisions',
      paragraphs: [
        'A score is only meaningful relative to what the candidate would actually do. Build the labelled set early: thirty to fifty postings the candidate has marked apply or skip, with a sentence of reasoning where it is not obvious.',
        'Measure agreement, and look at the disagreements individually — they are where the system is learning something. Often the model is right and the candidate was being inconsistent, which is itself worth surfacing rather than silently fitting to.',
        'Keep that set as a regression test rather than using it once. Every prompt change, model upgrade and scoring tweak should be run against it before shipping, because the alternative is discovering a regression through a candidate who stopped receiving good roles a fortnight ago.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why separate extraction from scoring?',
      a: 'So a wrong score is diagnosable — and so a posting seen by four hundred candidates is read once rather than four hundred times.',
    },
    {
      q: 'How do I stop the scorer rejecting good jobs?',
      a: 'Distinguish hard requirements from hopeful ones. Job descriptions ask for more than the role needs, and treating every listed technology as mandatory is the most common way these tools become useless.',
    },
    {
      q: 'Should the score be a single number?',
      a: 'No. Score skills, seniority, domain, location and compensation separately, and keep eligibility as a gate rather than a weight.',
    },
    {
      q: 'How do I know whether my scoring is any good?',
      a: 'Label thirty to fifty postings with the candidate’s own apply-or-skip decision and measure agreement. Study the disagreements — sometimes the model is right and the candidate was inconsistent.',
    },
    {
      q: 'Why do scores drift, and what should I do about it?',
      a: 'Model and prompt changes move them. Store both versions with each score and re-score the whole visible set at once, so a candidate never compares two scales.',
    },
    {
      q: 'Are numeric scores the right output?',
      a: 'Often bands are better. Strong, worth considering, a stretch, not a fit — less precise, more honest, and they stop a candidate reading meaning into the gap between 74 and 77.',
    },
  ],
  related: ['how-to-build-an-ai-job-relevance-score', 'how-to-match-a-resume-with-a-job-description', 'how-to-extract-skills-from-a-job-description'],
};

export default post;

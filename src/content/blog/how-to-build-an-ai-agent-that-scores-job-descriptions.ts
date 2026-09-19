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
  excerpt:
    'Scoring is two jobs pretending to be one: understanding what the posting asks for, and judging whether it is worth this candidate’s time.',
  sections: [
    {
      heading: 'Separate extraction from judgement',
      paragraphs: [
        'The mistake that makes scoring undebuggable is doing both in one model call. When a score looks wrong you cannot tell whether the system misread the posting or misjudged the fit, and you end up tuning a prompt that was never the problem.',
        'Run extraction first and store its output. Then score from the structured result. Now a bad score has a diagnosable cause, and improving scoring does not mean re-paying for extraction on every iteration.',
      ],
    },
    {
      heading: 'What to extract',
      paragraphs: [
        'Pull the posting into a comparable shape. The important distinction — and the one most implementations miss — is between what is genuinely required and what is listed hopefully.',
        'Job descriptions routinely ask for more than the role needs, because they are written defensively. A system that treats every listed technology as mandatory will reject roles the candidate would comfortably get, which is the most common way these tools become useless.',
      ],
      bullets: [
        'Hard requirements versus stated preferences versus aspiration',
        'Seniority, inferred from responsibilities rather than the title alone',
        'Work model and location, including contradictions between them',
        'Compensation if stated, with its currency and period',
        'Signals about the team: size, reporting line, stage',
      ],
    },
    {
      heading: 'Score against a profile, not a keyword list',
      paragraphs: [
        'The naive comparison counts overlapping terms, which rewards padding and misses everything expressed differently. A candidate who has built data pipelines for six years does not match a posting that says "ETL" if you are matching strings.',
        'Compare meaning instead, and score dimensions separately rather than producing one number: skills, seniority, domain, location and compensation each get their own judgement. A single blended figure hides the fact that a role is a perfect skills match in an impossible location.',
      ],
    },
    {
      heading: 'Always attach the reasoning',
      paragraphs: [
        'A bare score is useless to everyone. The candidate cannot tell whether to trust it, you cannot debug it, and it produces no signal for improving the system.',
        'Require a short written justification naming the specific matches and the specific gaps. This costs a few tokens and changes the product: it lets a candidate overrule a judgement for a reason, and it lets you find out that the model has been marking down every role that says "fast-paced".',
      ],
    },
    {
      heading: 'Calibrate against real decisions',
      paragraphs: [
        'A score is only meaningful relative to what the candidate would actually do. Build the labelled set early: thirty to fifty postings the candidate has marked apply or skip, with a sentence of reasoning where it is not obvious.',
        'Measure agreement, and look at the disagreements individually — they are where the system is learning something. Often the model is right and the candidate was being inconsistent, which is itself worth surfacing rather than silently fitting to.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why separate extraction from scoring?',
      a: 'So a wrong score is diagnosable. Combined in one call you cannot tell whether the system misread the posting or misjudged the fit, and you end up tuning the wrong half.',
    },
    {
      q: 'How do I stop the scorer rejecting good jobs?',
      a: 'Distinguish hard requirements from hopeful ones. Job descriptions ask for more than the role needs, and treating every listed technology as mandatory is the most common way these tools become useless.',
    },
    {
      q: 'Should the score be a single number?',
      a: 'No. Score skills, seniority, domain, location and compensation separately. A blended figure hides that a role is a perfect skills match in an impossible location.',
    },
    {
      q: 'How do I know whether my scoring is any good?',
      a: 'Label thirty to fifty postings with the candidate’s own apply-or-skip decision and measure agreement. Study the disagreements — sometimes the model is right and the candidate was inconsistent.',
    },
  ],
  related: ['how-to-build-an-ai-job-relevance-score', 'how-to-match-a-resume-with-a-job-description', 'how-to-extract-skills-from-a-job-description'],
};

export default post;

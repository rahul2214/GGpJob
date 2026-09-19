import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-reduce-hallucinations-in-ai-resume-generation',
  tint: 'rose',
  title: 'How to Reduce Hallucinations in AI Resume Generation',
  heading: 'Stopping a CV from inventing things',
  description:
    'Why resume generation invents credentials, the drift patterns to watch for, and the grounding and verification that keep generated text truthful.',
  keywords: [
    'ai resume hallucination',
    'resume generation accuracy',
    'grounded resume generation',
    'prevent ai inventing experience',
    'resume fact verification',
    'ai cv accuracy',
    'truthful resume ai',
    'resume generation safeguards',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'A fabricated line on a CV is not a model quality issue for the vendor. It is a credibility problem for the candidate, in an interview, months later.',
  sections: [
    {
      heading: 'Why generation invents here specifically',
      paragraphs: [
        'Asked to make a CV fit a job, a model is being asked to close a gap. When the source material does not contain what the posting wants, the instruction and the evidence conflict — and a model resolves that by producing something plausible.',
        'This is not random error. It is the predictable consequence of an instruction that implicitly asks for a better match than the facts support, which is why prompting for honesty alone does not fix it.',
      ],
    },
    {
      heading: 'The drift patterns',
      paragraphs: [
        'Outright fabrication is rare and easy to spot. The dangerous cases are small escalations that look like ordinary editing, each individually defensible and collectively a different person.',
        'Watching for these specific shapes is more effective than looking for "lies", because none of them reads as a lie in isolation.',
      ],
      bullets: [
        'Scope inflation — "contributed to" becomes "led"',
        'Number invention — an unquantified result gains a percentage',
        'Technology bleed — a tool from the posting appears in your history',
        'Seniority creep — the same work described one level up',
        'Timeline smoothing — a gap quietly disappears',
      ],
    },
    {
      heading: 'Ground every claim in a source span',
      paragraphs: [
        'The structural fix is requiring provenance. Each generated bullet must cite the part of the candidate’s original material it derives from, and anything without a source is rejected before a human ever sees it.',
        'This changes the task from "write a good CV for this job" to "select and rephrase from this material for this job", which is both the honest framing and a much easier problem for a model to do well.',
      ],
    },
    {
      heading: 'Verify after generating',
      paragraphs: [
        'Run a separate check over the output: do all numbers in the generated text appear in the source? Do all named technologies? Do the dates and titles match exactly?',
        'A second model call asked only to find unsupported claims catches a good deal, and a deterministic check on numbers, dates and proper nouns catches most of the rest at no model cost. Both are cheap relative to the consequence.',
      ],
    },
    {
      heading: 'Let the gap be visible',
      paragraphs: [
        'The most effective single change is telling the system it may not close gaps. When the posting asks for something the candidate lacks, the correct output says so rather than manufacturing coverage.',
        'This is better for the candidate too. Knowing a role wants two things they do not have is actionable — they can address it, or skip the application — whereas a CV that quietly claims both sets up a bad interview they will not see coming.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why does AI invent things on a resume?',
      a: 'Because it is asked to close a gap the source material does not support. When the instruction and the evidence conflict, the model produces something plausible — which is why asking it to be honest is not enough.',
    },
    {
      q: 'What kinds of drift should I watch for?',
      a: 'Scope inflation, invented numbers, technologies from the posting appearing in your history, seniority creep and smoothed timelines. Each looks like ordinary editing on its own.',
    },
    {
      q: 'What is the most effective safeguard?',
      a: 'Requiring every generated line to cite the source span it came from, and rejecting anything unsupported. It turns generation into selection and rephrasing, which is both honest and easier to do well.',
    },
    {
      q: 'What should happen when the candidate does not meet a requirement?',
      a: 'The system should say so rather than manufacture coverage. Knowing the gap is actionable; a CV that quietly claims it sets up an interview the candidate cannot survive.',
    },
  ],
  related: ['how-to-build-an-ai-resume-tailoring-system', 'ai-resume-writing-guide', 'how-to-build-reliable-ai-agents'],
};

export default post;

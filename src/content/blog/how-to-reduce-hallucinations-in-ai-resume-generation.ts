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
  anchors: ['resume hallucination', 'drift patterns'],
  excerpt:
    'A fabricated line on a CV is not a model quality issue for the vendor. It is a credibility problem for the candidate, in an interview, months later.',
  keyTakeaways: [
    'Invention is the predictable result of asking a model to close a gap the evidence does not support.',
    'The dangerous cases are small escalations, each individually defensible.',
    'Require a source span per line, which turns generation into selection and rephrasing.',
    'Verify deterministically on numbers, dates and proper nouns; they are cheap and catch most of it.',
    'Letting the gap be visible is better for the candidate than manufactured coverage.',
  ],
  sections: [
    {
      heading: 'Why generation invents here specifically',
      paragraphs: [
        'Asked to make a CV fit a job, a model is being asked to close a gap. When the source material does not contain what the posting wants, the instruction and the evidence conflict — and a model resolves that by producing something plausible.',
        'This is not random error. It is the predictable consequence of an instruction that implicitly asks for a better match than the facts support, which is why prompting for honesty alone does not fix it.',
        'Cover letters are worse than CVs for the same reason amplified. Prose has no structure pulling it back towards a record, so a sentence about a project the candidate did not run is easy to produce and easy to miss inside a fluent paragraph.',
      ],
    },
    {
      heading: 'The drift patterns',
      paragraphs: [
        'Outright fabrication is rare and easy to spot. The dangerous cases are small escalations that look like ordinary editing, each individually defensible and collectively a different person.',
        'Watching for these specific shapes is more effective than looking for "lies", because none of them reads as a lie in isolation.',
        'They also survive naive checking. A claim-matching pass that confirms the subject matter appears in the source will pass "led" where the record says "contributed to", because the content matches and only the strength changed.',
      ],
      bullets: [
        'Scope inflation — "contributed to" becomes "led"',
        'Number invention — an unquantified result gains a percentage',
        'Technology bleed — a tool from the posting appears in your history',
        'Seniority creep — the same work described one level up',
        'Timeline smoothing — a gap quietly disappears',
      ],
      table: {
        caption: 'What catches each pattern',
        columns: ['Pattern', 'Caught by', 'Missed by'],
        rows: [
          ['Invented technology', 'Proper-noun check against the record', 'Fluency review'],
          ['Invented number', 'Numeric check against the record', 'Fluency review'],
          ['Scope inflation', 'Strength comparison per line', 'Claim matching'],
          ['Seniority creep', 'Title copied, never generated', 'Prompted honesty'],
          ['Timeline smoothing', 'Dates copied, never generated', 'Everything else'],
          ['Emphasis distortion', 'A cap on how far emphasis may move', 'Line-level checks'],
        ],
      },
    },
    {
      heading: 'Ground every claim in a source span',
      paragraphs: [
        'The structural fix is requiring provenance. Each generated bullet must cite the part of the candidate’s original material it derives from, and anything without a source is rejected before a human ever sees it.',
        'This changes the task from "write a good CV for this job" to "select and rephrase from this material for this job", which is both the honest framing and a much easier problem for a model to do well.',
        'Go further and never let it write a fact at all. Dates, titles, employers and figures are copied from the structured record rather than generated, because a model that cannot produce a date cannot produce a wrong one — a stronger guarantee than any instruction about accuracy.',
      ],
    },
    {
      heading: 'Verify after generating',
      paragraphs: [
        'Run a separate check over the output: do all numbers in the generated text appear in the source? Do all named technologies? Do the dates and titles match exactly?',
        'A second model call asked only to find unsupported claims catches a good deal, and a deterministic check on numbers, dates and proper nouns catches most of the rest at no model cost. Both are cheap relative to the consequence.',
        'Check strength as well as content, since that is where the deterministic pass stops helping. Comparing the verb and scope of each generated line against its source catches the escalation that a content match approves.',
        'Do not let the generating model verify itself in the same call. A pass that is simultaneously trying to write well and to police its own output does both worse, and a separate check with a single job is more reliable and cheaper.',
      ],
    },
    {
      heading: 'Show the diff, not the document',
      paragraphs: [
        'Even a perfect verification pass needs a human at the end, and presenting a finished CV guarantees it stops being read by the fifth application. A reviewer skims a clean page and approves it.',
        'Show what changed instead: these three bullets were reworded, this summary rewritten, these roles dropped. Five diffs take less attention than one document and they direct that attention exactly where drift would appear.',
        'Flag the unverifiable lines rather than leaving them to be spotted. A line the system could not trace should arrive marked, because that is the one sentence on the screen that genuinely needs a person to decide.',
      ],
    },
    {
      heading: 'Let the gap be visible',
      paragraphs: [
        'The most effective single change is telling the system it may not close gaps. When the posting asks for something the candidate lacks, the correct output says so rather than manufacturing coverage.',
        'This is better for the candidate too. Knowing a role wants two things they do not have is actionable — they can address it, or skip the application — whereas a CV that quietly claims both sets up a bad interview they will not see coming.',
        'Ask before concluding the gap is real, though. Phrased as "your record does not evidence this — do you have it?", a large share of apparent gaps turn out to be things the candidate has and never wrote down, which is an addition rather than a fabrication.',
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
      a: 'Requiring every generated line to cite its source span, and copying dates, titles and figures rather than generating them. A model that cannot write a fact cannot write a wrong one.',
    },
    {
      q: 'What should happen when the candidate does not meet a requirement?',
      a: 'Ask first — many gaps are things they have and never wrote down — and otherwise say so plainly rather than manufacturing coverage.',
    },
    {
      q: 'Does a claim check catch everything?',
      a: 'No. It approves "led" where the record says "contributed to", because the content matches and only the strength changed. Verification has to compare strength too.',
    },
    {
      q: 'How should the output be reviewed?',
      a: 'As a diff with unverifiable lines flagged. A finished document gets skimmed by the fifth application; a diff directs attention exactly where drift appears.',
    },
  ],
  related: ['how-to-build-an-ai-resume-tailoring-system', 'ai-resume-writing-guide', 'how-to-build-reliable-ai-agents'],
};

export default post;

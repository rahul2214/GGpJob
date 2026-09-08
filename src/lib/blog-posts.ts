/**
 * Editorial content for /blog.
 *
 * Held in a plain, dependency-free module (no CMS, no markdown parser) so the
 * pages can be statically prerendered at build time. That matters here: static
 * pages were the only ones that stayed up — and stayed indexed — during the
 * serverless outage, and a blog only earns its keep if crawlers can always
 * reach it.
 *
 * Each post targets a keyword cluster around AI and hiring, and links back to
 * the ATS checker, the resume builder and the job search so the traffic has
 * somewhere to convert.
 */

import { AI_POSTS } from './blog-posts-ai';

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  /** SEO <title>; the root layout appends " | JobsDart". */
  title: string;
  /** On-page H1, usually shorter and more human than the SEO title. */
  heading: string;
  description: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  readingMinutes: number;
  category: string;
  /**
   * Soft background wash for the article hero. Purely decorative variety so
   * consecutive guides do not look identical; falls back to 'slate'.
   */
  tint?: HeroTint;
  excerpt: string;
  sections: BlogSection[];
  faqs?: BlogFaq[];
  /** Slugs of related posts, rendered as internal links. */
  related?: string[];
}

/**
 * Muted, low-saturation hero washes — full class strings rather than
 * constructed names, because Tailwind only keeps classes it can see literally.
 */
export type HeroTint = 'slate' | 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';

export const HERO_TINTS: Record<HeroTint, string> = {
  slate: 'bg-slate-50 dark:bg-slate-900/40',
  indigo: 'bg-indigo-50/70 dark:bg-indigo-950/25',
  emerald: 'bg-emerald-50/70 dark:bg-emerald-950/25',
  amber: 'bg-amber-50/70 dark:bg-amber-950/20',
  sky: 'bg-sky-50/70 dark:bg-sky-950/25',
  rose: 'bg-rose-50/60 dark:bg-rose-950/20',
  violet: 'bg-violet-50/70 dark:bg-violet-950/25',
};

export function heroTint(tint?: HeroTint): string {
  return HERO_TINTS[tint ?? 'slate'];
}

const CORE_POSTS: BlogPost[] = [
  {
    slug: 'how-to-use-ai-for-job-search',
    tint: 'indigo',
    title: 'How to Use AI for Your Job Search (2026 Guide)',
    heading: 'How to use AI for your job search',
    description:
      'A practical guide to using AI in your job search: match your resume to the job description, write sharper bullet points, and prep for interviews.',
    keywords: [
      'how to use ai for job search',
      'ai job search',
      'ai job search tools',
      'chatgpt for job search',
      'ai for job applications',
      'ai job hunting tips',
      'use ai to find a job',
      'ai career tools',
      'job search automation',
    ],
    publishedAt: '2026-09-07',
    updatedAt: '2026-09-07',
    author: 'JobsDart Editorial',
    readingMinutes: 8,
    category: 'AI & Careers',
    excerpt:
      'AI will not apply to jobs for you, and the candidates who let it try are easy to spot. Here is where it genuinely helps — and where it quietly costs you interviews.',
    sections: [
      {
        heading: 'Where AI actually helps in a job search',
        paragraphs: [
          'Most job search advice about AI is either breathless or dismissive. The useful version is narrower: AI is good at transformation and terrible at judgement. It can restructure what you already know into the shape a specific employer is scanning for. It cannot tell you which job is worth your next two years.',
          'That distinction decides where to spend your effort. Use AI for the mechanical, repetitive parts of applying — matching vocabulary, rewriting bullet points, drafting outreach, rehearsing answers. Keep the judgement calls, which company to target and what you actually want, firmly with yourself.',
        ],
        bullets: [
          'Tailoring an existing resume to a specific job description',
          'Turning vague responsibilities into quantified achievements',
          'Generating practice interview questions from a real posting',
          'Drafting follow-up and outreach messages you then edit',
          'Summarising a long job description into its real requirements',
        ],
      },
      {
        heading: 'Start with the job description, not your resume',
        paragraphs: [
          'The single highest-leverage move is to work backwards from the posting. Paste the job description somewhere first and pull out the concrete requirements: the tools named, the seniority signals, the outcomes the team cares about. Almost every posting repeats its true priorities two or three times in different words.',
          'Once you have that list, compare it against your resume honestly. The gap between the two is your entire application strategy. Some gaps you close by rewording something you have genuinely done; others are real, and pretending otherwise wastes everyone\'s time.',
          'This is exactly what an ATS score does mechanically. Running your resume and the job description through a checker surfaces the missing keywords in seconds instead of you eyeballing two documents side by side.',
        ],
      },
      {
        heading: 'Rewrite bullet points, do not generate them',
        paragraphs: [
          'The fastest way to make a resume worse with AI is to ask it to write your experience from scratch. It produces fluent, confident, entirely generic prose — the kind that reads identically across a hundred applications, because it is drawn from the same average of the internet everyone else is drawing from.',
          'Give it raw material instead. Write the ugly, honest version yourself: what you did, what broke, what changed, and any number you can remember. Then ask for a tighter rewrite. The output stays specific because the input was specific.',
        ],
        bullets: [
          'Bad input: "Worked on the payments team."',
          'Good input: "Rewrote the retry logic on failed card payments, cut failed transactions from about 8% to 3% over a quarter."',
          'The second one produces a usable bullet. The first produces filler.',
        ],
      },
      {
        heading: 'Use AI to rehearse, not to script',
        paragraphs: [
          'Interview preparation is where AI is genuinely underused. Paste a real job description and ask for the fifteen questions a hiring manager for that role would most likely ask. You will usually get ten obvious ones and three or four you had not considered — those are the valuable ones.',
          'Then answer out loud, badly, without writing a script. Reading a memorised answer is transparently obvious in an interview and removes the thing that actually persuades people, which is watching you think. Rehearse the material, not the wording.',
        ],
      },
      {
        heading: 'The mistakes that cost people interviews',
        paragraphs: [
          'Recruiters now read a lot of AI-assisted applications, and the tells are consistent. Cover letters that describe enthusiasm without evidence. Resumes where every bullet has the same rhythm and the same three verbs. Claims that collapse the moment someone asks a follow-up question.',
          'The last one is the serious one. If AI inflates a project you touched briefly into something you led, you will be asked about it in an interview, and the gap between the document and your answer is far more damaging than a modest resume would have been.',
        ],
        bullets: [
          'Never let AI invent numbers, titles, dates or scope',
          'Read every generated line and delete anything you cannot defend for five minutes',
          'Vary sentence structure — uniformity is the clearest AI tell',
          'Keep one honest master resume and tailor from it, rather than regenerating each time',
        ],
      },
      {
        heading: 'A workflow that takes about twenty minutes per application',
        paragraphs: [
          'Applying well to five roles beats applying carelessly to fifty. A repeatable loop keeps the quality high without the time cost spiralling.',
        ],
        bullets: [
          'Read the posting and note the three requirements it repeats most',
          'Run your resume against it for an ATS score and a missing-keyword list',
          'Rewrite three to five bullets to close the genuine gaps',
          'Export a fresh PDF for this application and keep the version',
          'Generate likely interview questions from the same posting and skim them',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can recruiters tell if my resume was written with AI?',
        a: 'Often, yes — but what they actually notice is genericness, not the tool. Uniform sentence rhythm, abstract achievements with no numbers, and claims that do not survive a follow-up question are the tells. A specific, quantified resume reads as human whether or not AI helped tighten the wording.',
      },
      {
        q: 'Is it acceptable to use AI to write a cover letter?',
        a: 'Yes, as a drafting aid. Give it real details — why this company, what you would work on, a relevant thing you have actually built — and edit the result. A cover letter generated from the job title alone says nothing and reads exactly like the other two hundred the recruiter received.',
      },
      {
        q: 'Does using AI hurt my ATS score?',
        a: 'No. Applicant tracking systems parse structure and keywords; they do not detect authorship. What hurts your score is formatting the system cannot read and missing the vocabulary from the job description — both of which AI can help you fix.',
      },
      {
        q: 'How many jobs should I apply to per week?',
        a: 'Fewer, better applications outperform volume. Ten to fifteen genuinely tailored applications a week beats a hundred generic ones, because tailored applications clear the automated screen and generic ones mostly do not.',
      },
    ],
    related: ['how-applicant-tracking-systems-work', 'ai-resume-writing-guide', 'ai-interview-preparation'],
  },

  {
    slug: 'will-ai-take-my-job',
    tint: 'sky',
    title: 'Will AI Take My Job? An Honest Answer',
    heading: 'Will AI take my job?',
    description:
      'Will AI take your job? Which roles are genuinely exposed, which are not, and what actually protects a career — based on how automation has really played out.',
    keywords: [
      'will ai take my job',
      'jobs ai will replace',
      'ai proof jobs',
      'is my job safe from ai',
      'ai job displacement',
      'future proof career',
      'ai and employment',
      'careers safe from automation',
      'ai impact on jobs',
    ],
    publishedAt: '2026-09-07',
    updatedAt: '2026-09-07',
    author: 'JobsDart Editorial',
    readingMinutes: 9,
    category: 'AI & Careers',
    excerpt:
      'The honest answer is: probably not your whole job, but very likely a meaningful part of it — and which part matters more than the headline number.',
    sections: [
      {
        heading: 'Jobs are bundles of tasks, not single things',
        paragraphs: [
          'Almost every alarming forecast about AI and employment shares one flaw: it treats a job as an indivisible unit that either survives or does not. Real jobs are bundles of tasks, and automation has historically taken tasks rather than whole occupations.',
          'Consider what happened to accountants after spreadsheets. The tedious arithmetic disappeared almost entirely. The profession did not — it grew, and shifted towards analysis and advice. The task changed; the job re-formed around what was left.',
          'That framing is more useful than a yes or no. Ask which tasks in your week are routine transformations of information, because those are the exposed ones, and what remains once they are gone.',
        ],
      },
      {
        heading: 'What current AI is genuinely good at',
        paragraphs: [
          'Being specific about capability is more useful than speculation. Today\'s systems are strong at producing plausible drafts, summarising and restructuring text, writing routine code, translating, and pattern-matching across large volumes of documents.',
          'They are weak wherever the cost of being confidently wrong is high, where context lives in people\'s heads rather than documents, where physical presence is required, and where the work is fundamentally about persuading, negotiating or holding responsibility.',
        ],
        bullets: [
          'Most exposed: routine content production, first-line support, basic data entry and reconciliation, template-driven documentation',
          'Partly exposed: junior software work, paralegal research, entry-level analysis, first-draft design',
          'Least exposed: skilled trades, healthcare delivery, work requiring accountability or negotiation, roles built on relationships and trust',
        ],
      },
      {
        heading: 'The entry-level squeeze is the real problem',
        paragraphs: [
          'The most credible concern is not mass unemployment. It is that AI is best at precisely the tasks juniors were historically hired to do — the first draft, the research summary, the simple ticket, the boilerplate.',
          'That breaks the traditional apprenticeship ladder. If nobody pays a junior to do the routine work, the profession loses the mechanism by which people become senior. This is a structural problem the industry has not solved, and if you are early in your career it is worth taking seriously rather than dismissing.',
          'The practical response is to get closer to the parts of the work that were never routine — ownership of an outcome, direct contact with users or customers, judgement under uncertainty — earlier than previous generations had to.',
        ],
      },
      {
        heading: 'What actually protects a career',
        paragraphs: [
          'Not "learning to code" or any other single skill. What holds up is a combination that is hard to unbundle: domain knowledge, judgement about what is worth doing, and the ability to take responsibility for a result.',
          'Notice that the person who uses these tools well tends to displace the person who refuses to, far more reliably than the tools displace either. That has been the pattern with every previous productivity technology, and it is the most actionable thing in this whole discussion.',
        ],
        bullets: [
          'Deepen domain expertise — AI is general, and generality is cheap',
          'Move towards owning outcomes rather than producing outputs',
          'Get fluent with the tools in your own field rather than avoiding them',
          'Build the relationships and reputation that no model has access to',
          'Keep a written record of what you have actually delivered',
        ],
      },
      {
        heading: 'Be honest about the uncertainty',
        paragraphs: [
          'Anyone giving you a confident percentage for how many jobs will vanish by a specific year is guessing. The historical record on technology forecasts is poor in both directions: predicted catastrophes that did not arrive, and disruptions nobody saw coming.',
          'What is reasonably well supported is narrower and more useful. Task composition within jobs is shifting quickly. Demand is rising for people who can direct these tools competently. And the transition is uneven — some people and regions absorb it far more easily than others.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Which jobs are safest from AI?',
        a: 'Roles combining physical presence, regulated accountability and human trust hold up best — skilled trades, healthcare delivery, and senior roles where someone must own the consequences of a decision. "Safe" is relative though: most jobs will change composition rather than disappear.',
      },
      {
        q: 'Should I change careers because of AI?',
        a: 'Rarely a good reason on its own. Switching fields resets your domain expertise, which is one of the main things that protects you. Deepening expertise in your current field while getting genuinely fluent with the tools is usually the stronger move.',
      },
      {
        q: 'Is it harder to get an entry-level job now?',
        a: 'In several white-collar fields, yes — the routine work juniors were hired for is exactly what these tools do well. Candidates who show ownership of a real outcome, rather than only coursework, are having noticeably more success.',
      },
    ],
    related: ['how-to-use-ai-for-job-search', 'highest-paying-ai-jobs', 'ai-interview-preparation'],
  },

  {
    slug: 'how-applicant-tracking-systems-work',
    tint: 'emerald',
    title: 'How Does an ATS Work? And How to Beat It',
    heading: 'How applicant tracking systems actually work',
    description:
      'How an applicant tracking system reads your resume, why strong candidates get filtered out, and the formatting and keyword rules that get you past the screen.',
    keywords: [
      'how does an ats work',
      'applicant tracking system',
      'how to beat ats',
      'ats resume tips',
      'ats friendly resume format',
      'ats resume checker',
      'resume keywords',
      'why is my resume rejected',
      'ats score meaning',
    ],
    publishedAt: '2026-09-07',
    updatedAt: '2026-09-07',
    author: 'JobsDart Editorial',
    readingMinutes: 7,
    category: 'Resumes & ATS',
    excerpt:
      'Most rejections are not judgements. They are parsing failures — and parsing failures are entirely fixable once you know what the software is doing.',
    sections: [
      {
        heading: 'What an ATS is, and what it is not',
        paragraphs: [
          'An applicant tracking system is fundamentally a database with a parser attached. It ingests your resume, tries to extract structured fields — name, contact details, employers, dates, titles, skills, education — and stores the result so recruiters can search and filter.',
          'It is worth correcting a persistent myth: mainstream systems do not assign a secret score and auto-reject below a threshold. What actually happens is more mundane and, in practice, worse. A recruiter searches for the skills they need, and you either appear in the results or you do not.',
          'That reframes the problem. You are not trying to satisfy an algorithm. You are trying to be findable, and to be parsed correctly enough that your experience is legible when a human does open the file.',
        ],
      },
      {
        heading: 'Why strong candidates get filtered out',
        paragraphs: [
          'The most common cause is parsing failure, not competence. If your work history sits inside a table, a text box, or a two-column layout, many parsers read it in the wrong order or drop it altogether. Contact details placed in the document header are routinely invisible.',
          'The second cause is vocabulary mismatch. If a posting asks for "React" and your resume says "front-end frameworks", a keyword search will not surface you. That is not dishonesty on either side; it is two different words for the same thing, and the search does not know that.',
        ],
        bullets: [
          'Multi-column layouts that scramble reading order',
          'Tables and text boxes the parser skips entirely',
          'Contact details in a header or footer region',
          'Scanned or image-based PDFs with no text layer',
          'Non-standard section names like "My Journey" instead of "Experience"',
          'Skills present in the role but absent from the wording',
        ],
      },
      {
        heading: 'The format that reliably parses',
        paragraphs: [
          'The rules are boring, which is the point. A single-column, reverse-chronological layout with conventional section headings parses correctly in essentially every system in common use.',
          'Export as a text-based PDF unless the posting explicitly asks for .docx. You can verify the text layer in ten seconds: open the PDF, try to select your name with the cursor. If it does not highlight as text, no parser can read it either.',
        ],
        bullets: [
          'One column, no tables, no text boxes, no graphics carrying information',
          'Standard headings: Summary, Skills, Experience, Projects, Education',
          'Contact details in the body, not the header',
          'Dates in a consistent format such as "Mar 2023 – Present"',
          'A standard font and a text-based PDF export',
        ],
      },
      {
        heading: 'Getting the keywords right without stuffing',
        paragraphs: [
          'Mirror the job description\'s own vocabulary where it is genuinely true of you. If it says "PostgreSQL" and you wrote "SQL databases", change it. If it names a methodology you have actually worked in, use their term for it.',
          'Keyword stuffing — hidden white text, a wall of unrelated technologies — is both easy to spot and counterproductive. Recruiters do open the file, and a skills section listing forty technologies signals nothing except padding. Depth in the handful that match the role is far more persuasive.',
        ],
      },
      {
        heading: 'How to check before you apply',
        paragraphs: [
          'Rather than guessing, compare your resume against the specific posting. A checker parses both documents the way an ATS would, surfaces the required skills that are missing from your resume, and shows which sections are thin.',
          'Two minutes of that before submitting is worth more than another hour of formatting. Once the gaps are visible, closing them is usually a matter of rewording things you have genuinely done.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is a good ATS score?',
        a: 'Aim for 80 or above against the specific job description. Between 70 and 79 usually clears the initial filter but leaves keyword gaps worth closing. Below 70 generally means the resume is unlikely to surface in a recruiter search for that role.',
      },
      {
        q: 'Should I send a PDF or a Word document?',
        a: 'A text-based PDF is the safe default — it preserves layout and every modern system parses it. Send .docx only when the posting or portal explicitly asks. Never send a scanned or image-based PDF; it has no text layer to read.',
      },
      {
        q: 'Do applicant tracking systems automatically reject resumes?',
        a: 'Mainstream systems do not auto-reject on a hidden score. The realistic failure mode is that your resume parses badly or lacks the vocabulary a recruiter searches for, so it never appears in their results — functionally a rejection, but a fixable one.',
      },
      {
        q: 'Does a one-page resume matter?',
        a: 'Less than people think, and not for parsing at all. One page suits early-career candidates; two is entirely normal with several years of experience. Relevance matters far more than length.',
      },
    ],
    related: ['ai-resume-writing-guide', 'how-to-use-ai-for-job-search'],
  },

  {
    slug: 'ai-resume-writing-guide',
    tint: 'violet',
    title: 'How to Write a Resume Using AI in 2026',
    heading: 'Writing a resume with AI, without sounding like everyone else',
    description:
      'How to write a resume with AI without sounding generic: the prompts that work, the patterns recruiters spot instantly, and what to never let AI write.',
    keywords: [
      'ai resume writing',
      'ai resume builder',
      'chatgpt resume prompts',
      'ai written resume',
      'resume bullet points generator',
      'how to write resume with ai',
      'ai cv writing',
      'quantified resume bullet points',
      'free ai resume builder',
    ],
    publishedAt: '2026-09-07',
    updatedAt: '2026-09-07',
    author: 'JobsDart Editorial',
    readingMinutes: 7,
    category: 'Resumes & ATS',
    excerpt:
      'AI writes fluent resumes and fluent is not the goal. Specific is. Here is how to keep the speed without landing in the generic pile.',
    sections: [
      {
        heading: 'The core problem with AI-written resumes',
        paragraphs: [
          'Ask a model to write your resume and it will produce something clean, confident and almost entirely interchangeable with the next candidate\'s. That is not a flaw in the tool — it is what it means to generate the most probable text. The most probable phrasing is, by definition, the phrasing everyone else gets.',
          'A resume works by being distinguishable. The fix is not to avoid AI but to change what you feed it: give it facts only you know, and let it handle the compression and phrasing.',
        ],
      },
      {
        heading: 'Feed it specifics, ask for compression',
        paragraphs: [
          'Write the raw version first, ugly and honest. What did you build, what was broken, what changed, and roughly by how much. Do not worry about the wording — that is the part the model is genuinely good at.',
          'Then ask for tightening rather than invention: keep it under two lines, lead with the outcome, keep every number, do not add anything that is not in my notes. That last constraint matters more than any other.',
        ],
        bullets: [
          'Raw: "I was on the checkout team, we had a lot of dropped payments, I changed how retries worked and it got better."',
          'Tightened: "Redesigned payment retry logic on the checkout service, reducing failed transactions from 8% to 3% in one quarter."',
          'Same facts. The model added structure, not content.',
        ],
      },
      {
        heading: 'Numbers are what make a resume credible',
        paragraphs: [
          'The difference between a forgettable bullet and a persuasive one is almost always a number. Scale, change, duration, frequency, money, users, time saved — any of them.',
          'If you genuinely do not have a metric, use scope instead: the size of the team, the number of systems, the volume handled. What you must not do is let a model invent a plausible-sounding percentage. That number will be asked about, and a fabricated one is far more damaging than no number at all.',
        ],
        bullets: [
          'How much did it change, and over what period?',
          'How many users, records, requests or customers?',
          'How large was the team, and what did you own within it?',
          'What did it cost or save?',
        ],
      },
      {
        heading: 'Patterns recruiters recognise immediately',
        paragraphs: [
          'Certain habits mark a document as machine-drafted and unedited. The strongest signal is rhythmic uniformity — every bullet the same length, opening with the same handful of verbs, closing with a vague benefit clause.',
          'Others are lexical: "leveraged", "spearheaded", "utilised" and "synergies" appearing at a density no human writes naturally. None of these are disqualifying on their own. Together, they signal that nobody edited the file, which is what actually costs you.',
        ],
        bullets: [
          'Vary bullet length deliberately — some short, some longer',
          'Cut abstract benefit clauses that assert impact without evidence',
          'Replace inflated verbs with plain ones: built, fixed, ran, cut, shipped',
          'Read the whole thing aloud once; anything you would not say, rewrite',
        ],
      },
      {
        heading: 'Tailor per application, from one honest master',
        paragraphs: [
          'Keep a single master resume containing everything you have genuinely done, in plain language. For each application, copy it and adjust emphasis to the posting — reorder bullets, swap vocabulary to match their terms, cut what is irrelevant to this role.',
          'This is much faster than regenerating from scratch each time, and it prevents the slow drift towards claims you cannot defend. Check the tailored version against the job description before sending, then export a fresh PDF and keep the version so you know what you sent.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Will an employer reject me for using AI on my resume?',
        a: 'Employers care about whether the content is accurate and specific, not which tool shaped the sentences. What gets rejected is genericness and claims that fall apart under questioning — both of which come from unedited output, not from the tool itself.',
      },
      {
        q: 'What is the best prompt for resume bullet points?',
        a: 'Supply the facts and constrain the output: "Here are my rough notes on this role. Rewrite each into one bullet under two lines, leading with the outcome. Keep every number. Do not add anything not present in my notes." The final constraint is the important one.',
      },
      {
        q: 'Should my resume be different for every job?',
        a: 'The emphasis should be. Keep one honest master version and tailor wording and ordering per application so it mirrors the posting\'s vocabulary. Full rewrites for each role are slow and tend to introduce claims you cannot support.',
      },
    ],
    related: ['how-applicant-tracking-systems-work', 'how-to-use-ai-for-job-search'],
  },

  {
    slug: 'highest-paying-ai-jobs',
    tint: 'amber',
    title: 'Highest Paying AI Jobs and How to Get One',
    heading: 'The highest paying AI jobs — and how to get into them',
    description:
      'The highest paying AI jobs, what each role actually involves day to day, the skills that get you hired, and realistic ways in from engineering or analytics.',
    keywords: [
      'highest paying ai jobs',
      'ai jobs salary',
      'how to get a job in ai',
      'machine learning engineer salary',
      'ai career path',
      'ai engineer jobs',
      'ml engineer vs data scientist',
      'best ai careers',
      'ai jobs for freshers',
    ],
    publishedAt: '2026-09-07',
    updatedAt: '2026-09-07',
    author: 'JobsDart Editorial',
    readingMinutes: 8,
    category: 'AI & Careers',
    excerpt:
      'The pay is real, and so is the competition. What separates people who get these roles is usually shipped work, not credentials.',
    sections: [
      {
        heading: 'The roles, and what they actually involve',
        paragraphs: [
          'The label "AI job" covers work that differs enormously day to day. Getting the distinction right matters, because preparing for the wrong one wastes months.',
          'Research roles are the smallest category and the hardest to enter, typically requiring publications and often a doctorate. Nearly all the hiring volume is in engineering roles: building systems that use models rather than inventing them.',
        ],
        bullets: [
          'Machine Learning Engineer — training, evaluating and deploying models in production; heavy software engineering',
          'AI / LLM Application Engineer — building products on top of existing models: retrieval, tool use, evaluation, guardrails',
          'Data Engineer — the pipelines everything else depends on; consistently in demand and often undervalued',
          'MLOps / Platform Engineer — serving, monitoring, cost and reliability of models in production',
          'Research Scientist — novel methods; smallest headcount, highest credential bar',
          'Applied Data Scientist — measurement, experimentation and decisions rather than model building',
        ],
      },
      {
        heading: 'What pay actually tracks',
        paragraphs: [
          'Published salary ranges vary so much by country, company stage and seniority that quoting a single figure would mislead you. The more useful observation is what compensation correlates with, because that is what you can influence.',
          'Three things move it consistently: proximity to revenue, scarcity of the specific skill, and whether you own an outcome or execute a task. An engineer who owns a system that demonstrably makes or saves money is paid differently from one who implements tickets, regardless of job title.',
          'The practical implication is to look past the title in a posting and read the responsibilities. Two roles called "AI Engineer" at different companies can be entirely different jobs at entirely different pay levels.',
        ],
      },
      {
        heading: 'The skills that come up in real postings',
        paragraphs: [
          'Strip away the buzzwords and hiring for these roles is more conventional than it appears. Strong software engineering underpins nearly all of it — most production AI work is data plumbing, evaluation and reliability rather than modelling.',
        ],
        bullets: [
          'Python, and genuinely solid general programming ability',
          'SQL and data modelling — underrated and asked about constantly',
          'Working knowledge of a modelling framework; depth matters less than being able to ship',
          'Retrieval, embeddings and evaluation for LLM application roles',
          'Cloud fundamentals, containers and CI/CD',
          'The ability to define what "working correctly" means and measure it',
        ],
      },
      {
        heading: 'Getting in from an adjacent role',
        paragraphs: [
          'Most people entering these jobs are not new graduates — they are backend engineers, data analysts or platform engineers who moved sideways. That is by far the most reliable route, because the surrounding engineering skill transfers directly.',
          'The thing that converts an application is a shipped, working project you can talk about in depth. Not a tutorial reproduction; something with real data, a real evaluation of whether it works, and an honest account of what broke. One such project outperforms a stack of certificates.',
        ],
        bullets: [
          'Build something end to end, deployed, that someone other than you has used',
          'Be able to explain your evaluation method and its weaknesses',
          'Move towards AI-adjacent work inside your current job first',
          'Mirror the posting\'s vocabulary on your resume — these roles are keyword-searched heavily',
        ],
      },
      {
        heading: 'A realistic note on competition',
        paragraphs: [
          'These postings attract very large applicant volumes, which means the automated screen matters more here than in most fields. A resume that does not name the specific tools in the posting frequently never surfaces in the recruiter\'s search, however capable the candidate.',
          'Before applying, check your resume against the actual job description and close the vocabulary gaps. It is the cheapest possible improvement to your odds, and for high-volume roles it is often the difference between being read and not being read.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need a PhD to work in AI?',
        a: 'For research scientist roles at labs, usually yes. For the large majority of AI engineering jobs, no — strong software engineering plus demonstrable shipped work matters far more than the degree.',
      },
      {
        q: 'What is the difference between an ML engineer and a data scientist?',
        a: 'ML engineers build and run models in production and are closer to software engineering. Data scientists focus on analysis, experimentation and informing decisions. The titles are used inconsistently, so read the responsibilities rather than the label.',
      },
      {
        q: 'Can freshers get AI jobs?',
        a: 'It is harder than for mid-level candidates because entry-level tasks are the ones most affected by automation, but it happens regularly. The candidates who succeed almost always have a real deployed project with an honest evaluation, rather than only coursework.',
      },
    ],
    related: ['will-ai-take-my-job', 'ai-interview-preparation', 'how-to-use-ai-for-job-search'],
  },

  {
    slug: 'ai-interview-preparation',
    tint: 'rose',
    title: 'How to Prepare for an Interview Using AI',
    heading: 'Preparing for interviews with AI',
    description:
      'Use AI to generate real interview questions from the job description, rehearse structured answers and research the company — without sounding rehearsed.',
    keywords: [
      'ai interview preparation',
      'interview questions from job description',
      'how to prepare for an interview',
      'mock interview ai',
      'behavioural interview questions',
      'star method examples',
      'interview practice',
      'job interview tips',
      'common interview questions',
    ],
    publishedAt: '2026-09-07',
    updatedAt: '2026-09-07',
    author: 'JobsDart Editorial',
    readingMinutes: 6,
    category: 'Interviews',
    excerpt:
      'The goal is not a script. It is having already thought about the hard questions once, so you are not doing it for the first time in the room.',
    sections: [
      {
        heading: 'Generate the question list from the real posting',
        paragraphs: [
          'Generic lists of interview questions are close to useless, because interviewers ask about the role in front of them. Paste the actual job description and ask for the fifteen questions a hiring manager for this specific role would most likely ask.',
          'You will typically get ten predictable ones and a handful you had not considered. Those last few are the entire value of the exercise — they are the questions you would otherwise have encountered cold.',
        ],
      },
      {
        heading: 'Build an evidence bank, not answers',
        paragraphs: [
          'Rather than preparing an answer per question, prepare six to eight stories from your experience and know each one well. Most behavioural questions are variations on a small set of themes, and the same story often answers several of them from different angles.',
          'For each story keep the situation, what you specifically did, the outcome, and what you would do differently. That last part is what distinguishes a reflective candidate from a rehearsed one, and interviewers consistently probe for it.',
        ],
        bullets: [
          'Something you shipped end to end',
          'Something that failed, and what you changed afterwards',
          'A disagreement with a colleague and how it resolved',
          'A time you worked with incomplete information',
          'Something you learned quickly under pressure',
          'A decision you made that turned out wrong',
        ],
      },
      {
        heading: 'Rehearse out loud, never from a script',
        paragraphs: [
          'Reading a memorised answer is obvious to anyone who interviews regularly. It also removes the thing that actually persuades people, which is watching you reason through something in real time.',
          'Say your answers aloud instead, from bullet points, and let the wording differ every time. If an answer runs past two minutes, it is too long — practise finding the shorter version.',
        ],
      },
      {
        heading: 'Research the company properly',
        paragraphs: [
          'Ask for a briefing on what the company does, who its customers are and what has changed recently, then verify the important claims yourself. Models get details about specific companies wrong with some regularity, and repeating a wrong fact in an interview is worse than not raising it.',
          'What you are looking for is enough context to ask a good question and to explain why this role, specifically, rather than any role.',
        ],
      },
      {
        heading: 'Prepare your own questions',
        paragraphs: [
          'The questions you ask are assessed, whether or not the interviewer says so. Vague ones about culture signal that you have not thought about the work; specific ones about how the team operates signal that you have.',
        ],
        bullets: [
          'What does the first ninety days look like for this role?',
          'How does work get prioritised when everything is urgent?',
          'What is currently the most frustrating part of this codebase or process?',
          'How do you know when someone in this role is doing well?',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can AI conduct a realistic mock interview?',
        a: 'It is good for generating questions and giving feedback on structure and length. It cannot replicate interview pressure or read your delivery, so use it to prepare material and practise aloud — ideally with a person for at least one run.',
      },
      {
        q: 'How long should an interview answer be?',
        a: 'Around ninety seconds to two minutes for behavioural questions. Long enough to give situation, action and outcome; short enough that the interviewer can follow up. Running past three minutes usually loses the room.',
      },
      {
        q: 'What should I do if I do not know the answer?',
        a: 'Say so, then reason aloud about how you would find out. Interviewers are frequently assessing your approach rather than a specific fact, and a confident wrong answer is a much worse signal than an honest one.',
      },
    ],
    related: ['how-to-use-ai-for-job-search', 'highest-paying-ai-jobs'],
  },
];

/**
 * Everything that renders on /blog. Split across two modules purely to keep
 * each file readable — consumers should always use this, not either half.
 */
export const BLOG_POSTS: BlogPost[] = [...CORE_POSTS, ...AI_POSTS];

/** Anchor id for a section heading, used by the in-article table of contents. */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CategoryStyle {
  /** Pill background + text, light and dark. */
  pill: string;
  /** Accent text colour for links and markers. */
  text: string;
  /** Gradient used for the card top rule and hero glow. */
  gradient: string;
  /** Ring colour applied on card hover. */
  ring: string;
}

/**
 * Per-category colour so the index reads as a set of distinct topics rather
 * than a uniform wall of cards. Indigo stays the primary brand accent.
 */
export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'AI & Careers': {
    pill: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    text: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500 to-violet-500',
    ring: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  },
  'Resumes & ATS': {
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500 to-teal-500',
    ring: 'hover:border-emerald-300 dark:hover:border-emerald-700',
  },
  Interviews: {
    pill: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
    ring: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  'AI Skills': {
    pill: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    text: 'text-sky-600 dark:text-sky-400',
    gradient: 'from-sky-500 to-cyan-500',
    ring: 'hover:border-sky-300 dark:hover:border-sky-700',
  },
  'AGI & Future': {
    pill: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500 to-fuchsia-500',
    ring: 'hover:border-violet-300 dark:hover:border-violet-700',
  },
  'AI & Hiring': {
    pill: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500 to-pink-500',
    ring: 'hover:border-rose-300 dark:hover:border-rose-700',
  },
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? CATEGORY_STYLES['AI & Careers'];
}

export function getAllPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return (post.related || [])
    .map(getPostBySlug)
    .filter((p): p is BlogPost => Boolean(p));
}

/** Word count drives the reading estimate shown on the index and article pages. */
export function wordCount(post: BlogPost): number {
  const body = post.sections
    .flatMap(s => [s.heading, ...s.paragraphs, ...(s.bullets || [])])
    .join(' ');
  const faqs = (post.faqs || []).flatMap(f => [f.q, f.a]).join(' ');
  return `${post.excerpt} ${body} ${faqs}`.split(/\s+/).filter(Boolean).length;
}

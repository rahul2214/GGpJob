import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
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
  anchors: ['skills section', 'writing a resume'],
  excerpt:
    'AI writes fluent resumes and fluent is not the goal. Specific is. Here is how to keep the speed without landing in the generic pile.',
  keyTakeaways: [
    'Generated resumes are interchangeable by construction — the most probable phrasing is what everyone else gets.',
    'Write the ugly honest version first, then ask for compression. Facts in, phrasing out.',
    'A number is what makes a bullet credible; a fabricated number is what ends an interview.',
    'Rhythmic uniformity is the clearest tell that nobody edited the file.',
    'Keep one honest master resume and tailor emphasis per role rather than regenerating each time.',
  ],
  sections: [
    {
      heading: 'The core problem with AI-written resumes',
      paragraphs: [
        'Ask a model to write your resume and it will produce something clean, confident and almost entirely interchangeable with the next candidate’s. That is not a flaw in the tool — it is what it means to generate the most probable text. The most probable phrasing is, by definition, the phrasing everyone else gets.',
        'A resume works by being distinguishable. The fix is not to avoid AI but to change what you feed it: give it facts only you know, and let it handle the compression and phrasing.',
        'This is why "write me a resume for a marketing manager role" fails so reliably. There is nothing in that request that belongs to you, so there is nothing in the output that does either.',
      ],
    },
    {
      heading: 'Feed it specifics, ask for compression',
      paragraphs: [
        'Write the raw version first, ugly and honest. What did you build, what was broken, what changed, and roughly by how much. Do not worry about the wording — that is the part the model is genuinely good at.',
        'Then ask for tightening rather than invention: keep it under two lines, lead with the outcome, keep every number, do not add anything that is not in my notes. That last constraint matters more than any other.',
        'If you find yourself with nothing to write in the raw version, that is useful information rather than a prompting problem. It usually means the role needs to be described by scope rather than by outcome, and no amount of generated prose will substitute for material that is not there.',
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
        'An approximate number you can stand behind beats a precise one you cannot. "Roughly a third fewer support tickets" is defensible and specific; "reduced support tickets by 34.7%" invites a question about how you measured it, and you should have an answer.',
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
        'The underlying problem is that these patterns make every candidate read the same. A recruiter working through eighty applications is looking for a reason to stop on one, and uniform competent prose gives them none.',
      ],
      bullets: [
        'Vary bullet length deliberately — some short, some longer',
        'Cut abstract benefit clauses that assert impact without evidence',
        'Replace inflated verbs with plain ones: built, fixed, ran, cut, shipped',
        'Read the whole thing aloud once; anything you would not say, rewrite',
      ],
      table: {
        caption: 'Common generated phrasing and what to replace it with',
        columns: ['Generated', 'Problem', 'Better'],
        rows: [
          ['Leveraged cross-functional synergies', 'Says nothing', 'Worked with design and support to…'],
          ['Spearheaded a transformative initiative', 'Unverifiable scale', 'Led the migration of 12 services to…'],
          ['Utilised cutting-edge technologies', 'Names nothing', 'Built it in Go with Postgres and Redis'],
          ['Drove significant improvements', 'No measure', 'Cut median response time from 4s to 900ms'],
          ['Responsible for managing stakeholders', 'Passive, vague', 'Ran the weekly review with three teams'],
        ],
      },
    },
    {
      heading: 'What AI should never touch',
      paragraphs: [
        'There is a short list of fields where generated text is a liability rather than a shortcut, and it is worth being absolute about them. Employers, titles, dates and qualifications are facts with external records behind them. A model rounding a title upward or smoothing a gap is producing something a reference check will contradict.',
        'The same applies to reasons for leaving, notice periods and anything on an application form with legal weight. These are answers you are giving as yourself, and a generated version can commit you to something you would not have said.',
        'Where a gap or an awkward fact exists, the honest short sentence outperforms the smoothed-over one every time. Employers see career breaks constantly; what they react badly to is discovering that a document was written to obscure one.',
      ],
    },
    {
      heading: 'Tailor per application, from one honest master',
      paragraphs: [
        'Keep a single master resume containing everything you have genuinely done, in plain language. For each application, copy it and adjust emphasis to the posting — reorder bullets, swap vocabulary to match their terms, cut what is irrelevant to this role.',
        'This is much faster than regenerating from scratch each time, and it prevents the slow drift towards claims you cannot defend. Check the tailored version against the job description before sending, then export a fresh PDF and keep the version so you know what you sent.',
        'Keeping the sent version matters more than it sounds. Once you have tailored twenty applications, the CV an interviewer is holding is one specific variant, and walking into a conversation unsure which achievements you led with is an avoidable disadvantage.',
      ],
      example: {
        title: 'One role, emphasised two ways',
        paragraphs: [
          'Master entry: "Backend engineer on the payments team. Rewrote retry logic, cut failed transactions 8% to 3%. Mentored two juniors. Ran the migration from a monolith to three services. On call rota."',
          'For a reliability-focused posting: lead with the migration and the on-call experience, and mention the retry work as evidence of production debugging.',
          'For a team-lead posting: lead with mentoring and the migration you ran end to end, and treat the retry numbers as supporting detail.',
          'Nothing was invented in either version. The ordering changed, and the ordering is what the recruiter reads first.',
        ],
      },
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
      a: 'The emphasis should be. Keep one honest master version and tailor wording and ordering per application so it mirrors the posting’s vocabulary. Full rewrites for each role are slow and tend to introduce claims you cannot support.',
    },
    {
      q: 'What if I have no numbers for a role?',
      a: 'Use scope instead — team size, number of systems, volume handled. An approximate figure you can defend beats a precise one you cannot, and an invented percentage is worse than none.',
    },
    {
      q: 'Which parts of a resume should AI never write?',
      a: 'Employers, titles, dates, qualifications, reasons for leaving and anything on a form with legal weight. Those have external records behind them, and smoothed versions get contradicted by a reference check.',
    },
    {
      q: 'How do I stop my resume sounding generated?',
      a: 'Vary bullet length, cut benefit clauses that assert impact without evidence, replace inflated verbs with plain ones, and read it aloud. Anything you would not say out loud gets rewritten.',
    },
  ],
  related: ['how-applicant-tracking-systems-work', 'how-to-use-ai-for-job-search', 'how-to-automatically-rewrite-a-resume-for-every-job'],
};

export default post;

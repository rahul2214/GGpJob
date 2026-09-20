import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-verify-a-job-posting-is-genuine',
  tint: 'rose',
  title: 'How to Verify Whether a Job Posting Is Genuine',
  heading: 'Verifying a job posting',
  description:
    'A practical checklist for checking a job advert before you apply — including ghost jobs and data-harvesting posts that are not fraud but still waste your time.',
  keywords: [
    'verify job posting',
    'is this job posting real',
    'ghost jobs',
    'fake job listing check',
    'how to check a job advert',
    'job posting red flags',
    'data harvesting job ads',
    'safe job applications',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Job Search Safety',
  anchors: ['verify a job posting', 'ghost jobs'],
  excerpt:
    'Not every bad posting is a scam. Some are roles that do not exist, and some exist only to collect CVs — and both cost you the same hours.',
  keyTakeaways: [
    'Three separate problems: fraud, ghost jobs, and harvesting. Only one is a crime; all three waste the same hours.',
    'A genuine opening is nearly always on the employer’s own careers page.',
    'Vagueness is the most reliable signal of a posting not tied to real work.',
    'Asking when a hire is expected is an ordinary question that a real process answers directly.',
    'The defence against harvesting is not putting harvestable data in the CV at all.',
  ],
  sections: [
    {
      heading: 'Three kinds of posting that waste your time',
      paragraphs: [
        'Fraudulent postings want money or documents. Ghost jobs are adverts for roles that are filled, frozen or never existed, kept live to build a pipeline or project growth. Harvesting posts exist to collect CVs for a database you never agreed to join.',
        'Only the first is a crime, but all three cost you the same thing — hours spent tailoring an application nobody will read. The checks below sort them apart before you invest.',
        'Distinguishing them matters because the responses differ. Fraud means stop and report; a ghost job means apply quickly if it is cheap and do not chase it; harvesting means send less rather than nothing.',
      ],
    },
    {
      heading: 'Check the company exists as described',
      paragraphs: [
        'Start with whether the legal entity is real and whether it matches the name on the advert. A company register lookup takes a minute and catches impersonation immediately, because a fraudulent posting usually borrows a real company’s name while operating from somewhere unconnected to it.',
        'Then check the careers page. A genuine opening is nearly always listed on the employer’s own site. A posting that exists only on a job board, especially with no matching page at the company, deserves a second look before you send anything personal.',
        'Agency postings are the legitimate exception and have their own check. A recruiter withholding the client name early is normal; being unable to describe the team, the role or the process is not, and that distinction separates a real agency mandate from a fishing exercise.',
      ],
      bullets: [
        'Legal entity on the company register, matching the advertised name',
        'The same role on the employer’s own careers page',
        'A physical address that resolves to something real',
        'A domain whose age matches the company’s claimed history',
        'Employees on professional networks who predate the posting',
      ],
      table: {
        caption: 'Three problems, three different responses',
        columns: ['Type', 'What it wants', 'What you should do'],
        rows: [
          ['Fraudulent posting', 'Money or documents', 'Stop, verify independently, report'],
          ['Ghost job', 'Pipeline, or the appearance of growth', 'Apply cheaply, do not chase'],
          ['Harvesting post', 'Your CV for a database', 'Send a CV with nothing harvestable'],
          ['Agency mandate', 'A placement fee, legitimately', 'Ask about team, role and process'],
          ['Real direct posting', 'To fill the role', 'Apply properly'],
        ],
      },
    },
    {
      heading: 'Read the posting itself for tells',
      paragraphs: [
        'Genuine job descriptions are specific because they are written by someone who needs a particular problem solved. Vagueness is the most reliable signal of a posting that is not tied to real work.',
        'Salary is the sharpest tell of all. A figure far above the market for the stated experience, attached to responsibilities nobody could summarise, is the oldest pattern there is — and it works precisely because it makes people want it to be true.',
        'A useful test is whether you could tell what the person would do in their first month. A real posting implies it even when it does not say so; a fabricated one describes an ideal candidate at length and never describes any actual work.',
      ],
    },
    {
      heading: 'Spotting a ghost job',
      paragraphs: [
        'Ghost jobs are legal and common, which makes them frustrating rather than dangerous. The signals are different: a posting reposted repeatedly over months, a role that has been live far longer than its seniority would suggest, or a description generic enough to fit any candidate.',
        'The efficient test is to ask. A short message to the recruiter asking when the team expects to make a hire, and whether the role is newly approved or a replacement, gets a straight answer from a real process and silence or vagueness from a pipeline-building one.',
        'Companies keep them live for reasons that are rarely malicious — a pipeline for an expected departure, a hiring freeze nobody updated the advert for, or an appearance of growth for investors. None of that helps you, which is why the check is worth the minute it takes.',
      ],
      bullets: [
        'Reposted at intervals over several months',
        'Live far longer than typical for the seniority',
        'No named hiring manager or team anywhere in the process',
        'Description generic enough to fit almost anyone',
        'Recruiter cannot say when a decision is expected',
      ],
    },
    {
      heading: 'A two-minute check that catches most of it',
      paragraphs: [
        'You cannot investigate every posting and you do not need to. The checks scale with what you are about to spend: a quick application deserves thirty seconds, and anything involving documents or a tailored portfolio deserves the full pass.',
        'The short version is three questions. Is this role on the company’s own careers page? Does the sender domain exactly match the company’s? Could I describe what this person would actually do?',
        'If all three pass, apply. If the first two pass and the third does not, it may be a ghost job — apply cheaply without tailoring heavily. If either of the first two fails, verify independently before sending anything at all.',
      ],
      example: {
        title: 'The same posting, checked',
        paragraphs: [
          'A posting for a senior backend role, salary noticeably above the local range, listing eleven technologies and describing the ideal candidate at length. Contact is a Gmail address, and the company name is one you recognise.',
          'Check one: the careers page has no such role. Check two: the sender domain is not the company’s at all. Check three: nothing in the advert describes any actual work.',
          'Three failures, ninety seconds spent, and no CV sent. The thing that made it plausible — a real company name — is the cheapest part of the whole construction to fake.',
        ],
      },
    },
    {
      heading: 'Protect what you send',
      paragraphs: [
        'The simplest defence against harvesting is not putting harvestable data in your CV. Your full address, date of birth and any identity or tax number are not needed to assess your suitability, and their presence is what makes a leaked CV valuable.',
        'Provide those at formal offer stage, to an employer you have verified, and not before. A legitimate process never needs them earlier, and a request for them earlier is itself one of the clearer signals you will get.',
        'A separate email address for job applications is worth the two minutes it takes. It keeps application traffic out of your main inbox, and if it starts receiving unrelated marketing you have learned something concrete about where your details travelled.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a ghost job?',
      a: 'A posting for a role that is already filled, frozen, or never existed — kept live to build a candidate pipeline or project growth. It is not fraud, but it costs you the same hours as one that is.',
    },
    {
      q: 'How can I tell if a job posting is real before applying?',
      a: 'Check the legal entity on the company register, confirm the same role appears on the employer’s own careers page, and look for specificity in the description. Vague responsibilities with an above-market salary is the classic pattern.',
    },
    {
      q: 'What should I leave off my CV?',
      a: 'Full address, date of birth, and identity or tax numbers. None are needed to assess suitability, and they are exactly what makes a harvested CV worth stealing. Supply them at offer stage to a verified employer.',
    },
    {
      q: 'Is it rude to ask a recruiter whether the role is real?',
      a: 'No — asking when a hire is expected and whether the role is new or a replacement is an ordinary professional question. A real process answers it directly; a pipeline-building one gets vague.',
    },
    {
      q: 'What is the fastest check worth doing?',
      a: 'Three questions: is the role on the company’s own careers page, does the sender domain match exactly, and could you describe what the person would actually do. That takes under two minutes.',
    },
    {
      q: 'Is an agency posting that hides the client suspicious?',
      a: 'Not by itself — withholding the client name early is normal. Being unable to describe the team, the role or the process is the real signal.',
    },
  ],
  related: ['fake-job-offer-scams', 'remote-job-scams', 'how-to-build-an-ai-agent-that-detects-jobs-worth-applying-to'],
};

export default post;

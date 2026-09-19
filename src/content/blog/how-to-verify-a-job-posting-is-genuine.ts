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
  excerpt:
    'Not every bad posting is a scam. Some are roles that do not exist, and some exist only to collect CVs — and both cost you the same hours.',
  sections: [
    {
      heading: 'Three kinds of posting that waste your time',
      paragraphs: [
        'Fraudulent postings want money or documents. Ghost jobs are adverts for roles that are filled, frozen or never existed, kept live to build a pipeline or project growth. Harvesting posts exist to collect CVs for a database you never agreed to join.',
        'Only the first is a crime, but all three cost you the same thing — hours spent tailoring an application nobody will read. The checks below sort them apart before you invest.',
      ],
    },
    {
      heading: 'Check the company exists as described',
      paragraphs: [
        'Start with whether the legal entity is real and whether it matches the name on the advert. A company register lookup takes a minute and catches impersonation immediately, because a fraudulent posting usually borrows a real company’s name while operating from somewhere unconnected to it.',
        'Then check the careers page. A genuine opening is nearly always listed on the employer’s own site. A posting that exists only on a job board, especially with no matching page at the company, deserves a second look before you send anything personal.',
      ],
      bullets: [
        'Legal entity on the company register, matching the advertised name',
        'The same role on the employer’s own careers page',
        'A physical address that resolves to something real',
        'A domain whose age matches the company’s claimed history',
        'Employees on professional networks who predate the posting',
      ],
    },
    {
      heading: 'Read the posting itself for tells',
      paragraphs: [
        'Genuine job descriptions are specific because they are written by someone who needs a particular problem solved. Vagueness is the most reliable signal of a posting that is not tied to real work.',
        'Salary is the sharpest tell of all. A figure far above the market for the stated experience, attached to responsibilities nobody could summarise, is the oldest pattern there is — and it works precisely because it makes people want it to be true.',
      ],
    },
    {
      heading: 'Spotting a ghost job',
      paragraphs: [
        'Ghost jobs are legal and common, which makes them frustrating rather than dangerous. The signals are different: a posting reposted repeatedly over months, a role that has been live far longer than its seniority would suggest, or a description generic enough to fit any candidate.',
        'The efficient test is to ask. A short message to the recruiter asking when the team expects to make a hire, and whether the role is newly approved or a replacement, gets a straight answer from a real process and silence or vagueness from a pipeline-building one.',
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
      heading: 'Protect what you send',
      paragraphs: [
        'The simplest defence against harvesting is not putting harvestable data in your CV. Your full address, date of birth and any identity or tax number are not needed to assess your suitability, and their presence is what makes a leaked CV valuable.',
        'Provide those at formal offer stage, to an employer you have verified, and not before. A legitimate process never needs them earlier, and a request for them earlier is itself one of the clearer signals you will get.',
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
  ],
  related: ['fake-job-offer-scams', 'remote-job-scams', 'fake-recruiter-scams'],
};

export default post;

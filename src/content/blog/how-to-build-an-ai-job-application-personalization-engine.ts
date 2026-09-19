import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-application-personalization-engine',
  tint: 'emerald',
  title: 'How to Build an AI Job Application Personalization Engine',
  heading: 'Personalising an application',
  description:
    'What personalisation means beyond inserting a company name: the research layer, what is worth referencing, quality gates, and the scale where it stops working.',
  keywords: [
    'application personalization engine',
    'personalised job applications',
    'cover letter personalisation',
    'company research automation',
    'application quality gate',
    'personalisation at scale',
    'ai application writing',
    'genuine personalisation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Resumes & ATS',
  excerpt:
    'Inserting the company name is not personalisation. Recruiters can tell, and a template with a merge field is worse than no letter.',
  sections: [
    {
      heading: 'Personalisation is specificity, not substitution',
      paragraphs: [
        'The mail-merge version — same letter, different company name — reads exactly like what it is. Recruiters see dozens a week and it signals that the applicant did nothing, which is worse than a short honest note.',
        'Real personalisation says something that could only be said about this application: this requirement against this experience, this product against this project. That requires actual information about the role and the candidate, not a template with a slot.',
      ],
    },
    {
      heading: 'Build the research layer deliberately',
      paragraphs: [
        'To say something specific, the system needs material: the posting in full, what the company does, the team if it is identifiable, and the candidate’s relevant history. Most of this is available without scraping anything sensitive.',
        'Keep it bounded. Trawling for personal details about the hiring manager is an easy way to produce something that reads as intrusive rather than interested, and candidates will not notice the line was crossed until it is in front of the employer.',
      ],
      bullets: [
        'The posting, in full, including the parts below the fold',
        'What the company does, in its own words',
        'The candidate achievements relevant to this specific role',
        'Nothing personal about individuals beyond a publicly stated role',
      ],
    },
    {
      heading: 'Reference things that mean something',
      paragraphs: [
        'Not every fact is worth mentioning. A recent funding round says nothing about why this candidate fits, and reciting a company’s own marketing back to them is filler that a reader skips.',
        'The references that land connect the company to the candidate: a technical problem in the posting they have solved, a market they know, a product they use. If the connection cannot be stated in one sentence, leave it out.',
      ],
    },
    {
      heading: 'Gate on quality, not on completion',
      paragraphs: [
        'Generative systems always produce something, and something is often generic. Without a gate, the engine reliably emits competent, forgettable text for every application and the candidate never knows.',
        'Check each output for specificity before it is used: does it name a concrete requirement, does it cite a real achievement from the record, would it read as wrong if pasted into a different application. If it passes that last test, it is not personalised and should be rejected.',
      ],
    },
    {
      heading: 'It does not survive volume',
      paragraphs: [
        'Genuine personalisation needs genuine connection, and a candidate does not have a genuine connection to fifty companies a week. At that volume the system starts producing plausible sentences about companies the applicant does not care about.',
        'Cap it. Personalise deeply where the candidate actually wants the role, and use a short honest application elsewhere. A modest number of specific applications outperforms fifty generated ones by a margin everyone in hiring recognises.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is inserting the company name personalisation?',
      a: 'No, and recruiters recognise it immediately. It signals the applicant did nothing, which is worse than a short honest note with no letter at all.',
    },
    {
      q: 'What information does genuine personalisation need?',
      a: 'The full posting, what the company does in its own words, and the candidate specific relevant achievements — and nothing personal about individuals beyond a publicly stated role.',
    },
    {
      q: 'What kinds of details are worth referencing?',
      a: 'Ones connecting the company to the candidate — a problem in the posting they have solved, a market they know. Funding news and recited marketing copy are filler.',
    },
    {
      q: 'Does personalisation work at high volume?',
      a: 'No. Genuine connection does not scale to fifty companies a week. Personalise deeply where the candidate wants the role and send a short honest application elsewhere.',
    },
  ],
  related: ['how-to-build-an-ai-cover-letter-generator', 'can-ai-personalize-100-job-applications', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;

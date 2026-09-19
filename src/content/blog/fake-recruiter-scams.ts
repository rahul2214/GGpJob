import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'fake-recruiter-scams',
  tint: 'rose',
  title: 'Fake Recruiter Scams: How to Tell a Real Recruiter From a Fraud',
  heading: 'Spotting a fake recruiter',
  description:
    'How fake recruiter scams operate, how they differ from fake job offers, the checks that expose them, and how to protect your data during a normal job search.',
  keywords: [
    'fake recruiter',
    'recruiter scam',
    'fake recruiter linkedin',
    'recruitment fraud',
    'how to verify a recruiter',
    'job search data privacy',
    'recruiter scam signs',
    'fake headhunter',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Job Search Safety',
  excerpt:
    'A fake recruiter does not need to offer you a job. Often the conversation itself is the product, and what they collect along the way is the payoff.',
  sections: [
    {
      heading: 'How this differs from a fake offer',
      paragraphs: [
        'A fake job offer aims at a single transaction — a fee, or a set of documents. A fake recruiter often plays a longer game, and may never make an offer at all. The relationship is the mechanism, and it can run for weeks while seeming entirely normal.',
        'That makes it harder to spot, because nothing obviously wrong happens. You are being interviewed, asked reasonable questions, and gradually supplying a detailed picture of yourself, your employer and your systems. The absence of an ask is what makes it feel safe.',
      ],
    },
    {
      heading: 'What they are actually collecting',
      paragraphs: [
        'Sometimes the target is you: identity documents, personal details, enough information to impersonate you or answer your security questions. Sometimes the target is your employer, and the interview is a pretext for reconnaissance dressed as technical curiosity.',
        'That second pattern deserves particular attention from anyone in a technical role. Questions about your internal tooling, cloud provider, deployment process or security controls are normal in small quantity and abnormal in detail. A genuine interviewer wants to know what you can do; they do not need your employer’s architecture.',
      ],
      bullets: [
        'Personal data — date of birth, address history, identity numbers',
        'Your employer’s internal tooling, vendors and processes',
        'Credentials, through a "technical assessment" requiring a login',
        'Malware, delivered as a coding task or assessment tool to install',
        'Your professional network, harvested through referral requests',
      ],
    },
    {
      heading: 'The checks that expose them',
      paragraphs: [
        'Most fraudulent recruiter accounts fail simple scrutiny, because building a convincing professional history takes time that a disposable account does not have.',
        'Look at the account itself rather than the message. Recently created, few genuine connections, a profile photo that reverse-searches to a stock library, an employment history that does not appear on the agency’s own site. Real recruiters have a professional footprint that predates their contact with you.',
      ],
      bullets: [
        'Check account age and connection history',
        'Reverse image search the profile photo',
        'Confirm the person on the agency’s own website, found independently',
        'Check the email domain exactly — lookalike domains are the standard trick',
        'Ask for a call on a number you look up yourself',
      ],
    },
    {
      heading: 'The technical assessment vector',
      paragraphs: [
        'A specific pattern targets developers: a take-home assessment that requires running unfamiliar code or installing a tool. The code contains something malicious, and the developer has been persuaded to execute it on their own machine — frequently a work machine.',
        'Treat any assessment code as untrusted. Read it before running it. Run it in a container or disposable virtual machine, never on a machine with access to your employer’s systems. A legitimate employer will not object; anyone who pressures you to run something directly has told you what you need to know.',
      ],
    },
    {
      heading: 'What normal recruiters actually do',
      paragraphs: [
        'It helps to know the legitimate baseline. A real recruiter names the client company early or explains plainly why they cannot yet. They discuss salary ranges. They can describe the team, the role and the process. They do not need your identity documents to submit you for a role.',
        'They also accept verification without offence. A genuine professional understands why you want to call the office number listed on the company website, and is not thrown by it. Irritation at being verified is itself a signal.',
      ],
    },
    {
      heading: 'Protecting yourself without becoming paranoid',
      paragraphs: [
        'You cannot verify every message and you do not need to. Scale your caution to what is being asked: replying to an initial message costs nothing, while sharing documents or running code deserves real scrutiny.',
        'A practical habit is keeping sensitive details out of a CV entirely. Your full address, date of birth and identity numbers are not needed to assess your suitability, and are exactly what makes a stolen CV valuable. Provide them at formal offer stage, to a verified employer, and not before.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How can I verify a recruiter is genuine?',
      a: 'Check the account’s age and history, reverse image search the photo, confirm the person on the agency site you found independently, and offer to call a number you looked up yourself. Genuine recruiters accept verification without offence.',
    },
    {
      q: 'Is it safe to do a take-home coding assessment?',
      a: 'Usually, with precautions. Read any supplied code before running it, and run it in a container or disposable virtual machine — never on a machine with access to your employer’s systems. Pressure to run it directly is a warning sign.',
    },
    {
      q: 'What information should never be on my CV?',
      a: 'Full address, date of birth, identity or tax numbers, and marital status. None are needed to assess suitability, and all are what make a harvested CV valuable for identity fraud. Provide them at offer stage to a verified employer.',
    },
    {
      q: 'Why would a fake recruiter ask about my current employer’s systems?',
      a: 'Because the interview may be reconnaissance. Detailed questions about internal tooling, cloud providers or security controls go beyond assessing your skills and should be answered in general terms only.',
    },
  ],
  related: ['fake-job-offer-scams', 'how-companies-use-ai-in-hiring', 'remote-tech-jobs'],
};

export default post;

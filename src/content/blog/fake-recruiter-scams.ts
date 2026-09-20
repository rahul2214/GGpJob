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
  anchors: ['fake recruiter', 'recruitment fraud'],
  excerpt:
    'A fake recruiter does not need to offer you a job. Often the conversation itself is the product, and what they collect along the way is the payoff.',
  keyTakeaways: [
    'A fake offer wants one transaction; a fake recruiter often plays a longer game and may never make an offer.',
    'The absence of an ask is what makes it feel safe, and what makes it hard to spot.',
    'Sometimes the target is not you but your employer, and the interview is reconnaissance.',
    'Treat any assessment code as untrusted — read it, then run it in a disposable environment.',
    'Genuine recruiters accept verification without offence; irritation at being checked is itself a signal.',
  ],
  sections: [
    {
      heading: 'How this differs from a fake offer',
      paragraphs: [
        'A fake job offer aims at a single transaction — a fee, or a set of documents. A fake recruiter often plays a longer game, and may never make an offer at all. The relationship is the mechanism, and it can run for weeks while seeming entirely normal.',
        'That makes it harder to spot, because nothing obviously wrong happens. You are being interviewed, asked reasonable questions, and gradually supplying a detailed picture of yourself, your employer and your systems. The absence of an ask is what makes it feel safe.',
        'It also means the usual advice does not fire. "Never pay a fee" is excellent guidance that this pattern simply steps around, because at no point does anyone ask you for money.',
      ],
    },
    {
      heading: 'What they are actually collecting',
      paragraphs: [
        'Sometimes the target is you: identity documents, personal details, enough information to impersonate you or answer your security questions. Sometimes the target is your employer, and the interview is a pretext for reconnaissance dressed as technical curiosity.',
        'That second pattern deserves particular attention from anyone in a technical role. Questions about your internal tooling, cloud provider, deployment process or security controls are normal in small quantity and abnormal in detail. A genuine interviewer wants to know what you can do; they do not need your employer’s architecture.',
        'The distinction to hold onto is between your skills and your employer’s specifics. Describing how you would design a deployment pipeline is what an interview is for; naming your employer’s vendors, versions and access controls is not, and a real interviewer does not need it to assess you.',
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
        'Generated profile photos have weakened the reverse-image check, since a synthetic face returns no matches at all. Treat "no results" as uninformative rather than reassuring, and weight the account history and independent confirmation more heavily.',
      ],
      bullets: [
        'Check account age and connection history',
        'Reverse image search the profile photo',
        'Confirm the person on the agency’s own website, found independently',
        'Check the email domain exactly — lookalike domains are the standard trick',
        'Ask for a call on a number you look up yourself',
      ],
      table: {
        caption: 'Normal recruiter behaviour against the fraudulent version',
        columns: ['Behaviour', 'Genuine', 'Fraudulent'],
        rows: [
          ['Naming the client', 'Early, or explains why not yet', 'Vague indefinitely'],
          ['Salary', 'Discusses a range', 'Avoids, or promises unusually high'],
          ['Your documents', 'Not needed to submit you', 'Requested early as process'],
          ['Being verified', 'Expects it, unbothered', 'Deflects or takes offence'],
          ['Assessment code', 'Public repository, readable', 'Installer, or code you must run directly'],
          ['Questions about your employer', 'General, about your role', 'Specific, about systems and vendors'],
        ],
      },
    },
    {
      heading: 'The technical assessment vector',
      paragraphs: [
        'A specific pattern targets developers: a take-home assessment that requires running unfamiliar code or installing a tool. The code contains something malicious, and the developer has been persuaded to execute it on their own machine — frequently a work machine.',
        'Treat any assessment code as untrusted. Read it before running it. Run it in a container or disposable virtual machine, never on a machine with access to your employer’s systems. A legitimate employer will not object; anyone who pressures you to run something directly has told you what you need to know.',
        'The risk is not only to you. Running unknown code on a work machine puts your employer’s network in scope, which turns a personal lapse into an incident you will have to explain — and is a strong practical reason to keep job-search activity off work equipment entirely.',
      ],
    },
    {
      heading: 'What normal recruiters actually do',
      paragraphs: [
        'It helps to know the legitimate baseline. A real recruiter names the client company early or explains plainly why they cannot yet. They discuss salary ranges. They can describe the team, the role and the process. They do not need your identity documents to submit you for a role.',
        'They also accept verification without offence. A genuine professional understands why you want to call the office number listed on the company website, and is not thrown by it. Irritation at being verified is itself a signal.',
        'Knowing the baseline matters because it stops the check being adversarial. You are not accusing anyone; you are doing the ordinary thing that every careful candidate does, and a real recruiter has encountered it many times before.',
      ],
    },
    {
      heading: 'If you are currently employed',
      paragraphs: [
        'There is a second risk that has nothing to do with fraud: the conversation itself is confidential, and handling it carelessly can cost you your current job before any new one materialises.',
        'Keep it off work systems entirely. Work email, work devices and work messaging are visible to your employer, and a job search conducted through them is discoverable in ways people consistently underestimate.',
        'Be careful with what you disclose about your current employer even to a genuine recruiter. Compensation structures, team plans and internal problems are things you may be contractually obliged to keep confidential, and a recruiter who represents competitors has an interest in them.',
      ],
    },
    {
      heading: 'Protecting yourself without becoming paranoid',
      paragraphs: [
        'You cannot verify every message and you do not need to. Scale your caution to what is being asked: replying to an initial message costs nothing, while sharing documents or running code deserves real scrutiny.',
        'A practical habit is keeping sensitive details out of a CV entirely. Your full address, date of birth and identity numbers are not needed to assess your suitability, and are exactly what makes a stolen CV valuable. Provide them at formal offer stage, to a verified employer, and not before.',
        'Set the threshold in advance rather than in the moment. Replying, talking and interviewing are low-risk; documents, credentials and executing code are the three points where you stop and verify, regardless of how well the conversation has gone until then.',
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
    {
      q: 'Is a reverse image search still useful?',
      a: 'Less than it was. Generated profile photos return no matches, so treat "no results" as uninformative rather than reassuring and weight account history and independent confirmation more heavily.',
    },
    {
      q: 'Should I job search from my work laptop?',
      a: 'No. Work devices and accounts are visible to your employer, and running an unknown assessment on one puts their network in scope — turning a personal lapse into an incident you have to explain.',
    },
  ],
  related: ['fake-job-offer-scams', 'how-companies-use-ai-in-hiring', 'remote-job-scams'],
};

export default post;

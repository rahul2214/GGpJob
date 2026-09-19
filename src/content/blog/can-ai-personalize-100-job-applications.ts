import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'can-ai-personalize-100-job-applications',
  tint: 'amber',
  title: 'Can AI Personalize 100 Job Applications?',
  heading: 'Where personalisation runs out',
  description:
    'What personalisation means when it is produced at scale, which parts survive and which do not, and what recipients can tell from the result.',
  keywords: [
    'personalise job applications at scale',
    'ai cover letter scale',
    'personalisation limits',
    'generated application detection',
    'application quality volume',
    'specificity in applications',
    'mass personalisation',
    'job application writing',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI & Careers',
  excerpt:
    'It can produce a hundred different documents. Whether any of them are personalised is a different question.',
  sections: [
    {
      heading: 'Different is not personalised',
      paragraphs: [
        'A system can certainly generate a hundred distinct letters, each mentioning a different company and rearranged around a different requirement list. That is variation, and it is what most tools deliver.',
        'Personalisation means the document reflects something true about why this candidate and this role fit. That requires input the system does not have unless the candidate supplies it, and a candidate does not have a considered view of a hundred companies.',
      ],
    },
    {
      heading: 'What scales and what does not',
      paragraphs: [
        'Matching your experience to the stated requirements scales well, because both are in text the system can read. Explaining which of your projects is relevant to this role is genuinely automatable and genuinely useful.',
        'What does not scale is why this company: a real interest, a connection to what they build, a reason it is this employer rather than a similar one. Manufactured at volume, it reads as manufactured.',
      ],
      bullets: [
        'Scales — mapping your experience onto stated requirements',
        'Scales — selecting the relevant achievements for this role',
        'Does not scale — genuine interest in a specific company',
        'Does not scale — anything requiring knowledge the candidate lacks',
      ],
    },
    {
      heading: 'Recipients detect the difference',
      paragraphs: [
        'People reading many applications develop a reliable sense for generated text, and the signal is structural — the same rhythm, the same shape of paragraph, the same closing. Rewording does not remove it.',
        'And a letter that is obviously generated is worse than no letter, because it demonstrates effort avoided while pretending to effort spent.',
      ],
    },
    {
      heading: 'A hundred is the wrong target',
      paragraphs: [
        'The volume is the problem rather than the automation. Ten applications, each personalised where personalisation is real, outperform a hundred that vary without being specific.',
        'If a search genuinely needs a hundred applications, send them without pretending each one is a considered expression of interest. An honest short application is better received than an elaborate one that nobody believes.',
      ],
    },
    {
      heading: 'Where the effort actually belongs',
      paragraphs: [
        'The parts of an application that get read carefully are the free-text answers and the CV’s relevance to the specific role. Those are worth real attention.',
        'Automate the mechanics and the requirement mapping. Reserve your own thinking for the few applications where it will change the outcome — that is a hundred times more valuable than spreading it across a hundred.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can AI personalise a hundred applications?',
      a: 'It can make a hundred different documents. Personalisation needs something true about why this candidate and this role fit, and nobody has a considered view of a hundred companies.',
    },
    {
      q: 'Which parts of personalisation scale?',
      a: 'Mapping your experience onto stated requirements and selecting relevant achievements. Genuine interest in a specific company does not scale and reads as manufactured.',
    },
    {
      q: 'Can recipients tell?',
      a: 'Usually. The signal is structural — the same rhythm, paragraph shape and closing — so rewording does not hide it, and an obviously generated letter is worse than none.',
    },
    {
      q: 'What should I do if I need high volume?',
      a: 'Send short honest applications rather than elaborate ones nobody believes, and reserve your own thinking for the few where it changes the outcome.',
    },
  ],
  related: ['how-to-build-an-ai-job-application-personalization-engine', 'can-ai-apply-to-100-jobs-a-day', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;

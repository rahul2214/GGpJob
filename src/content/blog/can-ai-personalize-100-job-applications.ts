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
  anchors: ['personalisation at scale', 'mass personalisation'],
  excerpt:
    'It can produce a hundred different documents. Whether any of them are personalised is a different question.',
  keyTakeaways: [
    'Variation is not personalisation: a hundred distinct documents can all be generic.',
    'Mapping experience to stated requirements scales; genuine interest in a company does not.',
    'The detection signal is structural, so rewording does not remove it.',
    'A visibly generated letter is worse than none — it advertises effort avoided.',
    'Short and honest beats elaborate and unbelievable when volume is genuinely necessary.',
  ],
  sections: [
    {
      heading: 'Different is not personalised',
      paragraphs: [
        'A system can certainly generate a hundred distinct letters, each mentioning a different company and rearranged around a different requirement list. That is variation, and it is what most tools deliver.',
        'Personalisation means the document reflects something true about why this candidate and this role fit. That requires input the system does not have unless the candidate supplies it, and a candidate does not have a considered view of a hundred companies.',
        'The clearest test is subtraction. Remove the company name and the requirement list from the letter, and if what remains would work for any employer in the sector, the document was varied rather than personalised — whatever it cost to produce.',
      ],
    },
    {
      heading: 'What scales and what does not',
      paragraphs: [
        'Matching your experience to the stated requirements scales well, because both are in text the system can read. Explaining which of your projects is relevant to this role is genuinely automatable and genuinely useful.',
        'What does not scale is why this company: a real interest, a connection to what they build, a reason it is this employer rather than a similar one. Manufactured at volume, it reads as manufactured.',
        'The line between them is simply whether the information exists somewhere the system can reach. Your achievements are in your CV; your reason for caring about this particular company is not written down anywhere, and a model asked to supply it will produce something that sounds right and is not true.',
      ],
      bullets: [
        'Scales — mapping your experience onto stated requirements',
        'Scales — selecting the relevant achievements for this role',
        'Does not scale — genuine interest in a specific company',
        'Does not scale — anything requiring knowledge the candidate lacks',
      ],
      table: {
        caption: 'Where the information has to come from',
        columns: ['Element', 'Source', 'Scales'],
        rows: [
          ['Relevant achievements', 'Your CV', 'Yes'],
          ['Requirement mapping', 'The posting', 'Yes'],
          ['Correct tone for the sector', 'General knowledge', 'Yes'],
          ['Why this company', 'Only you', 'No'],
          ['A connection to someone there', 'Only you', 'No'],
          ['A view on their product', 'Only you, after using it', 'No'],
        ],
      },
    },
    {
      heading: 'Recipients detect the difference',
      paragraphs: [
        'People reading many applications develop a reliable sense for generated text, and the signal is structural — the same rhythm, the same shape of paragraph, the same closing. Rewording does not remove it.',
        'And a letter that is obviously generated is worse than no letter, because it demonstrates effort avoided while pretending to effort spent.',
        'The most damaging tell is flattery with no content behind it. A paragraph admiring a company’s "commitment to innovation" says nothing that could not be said about any employer, and a reader who has seen it forty times this month reads it as a confession rather than a compliment.',
      ],
    },
    {
      heading: 'The one thing that does scale, cheaply',
      paragraphs: [
        'There is a middle option that costs almost nothing and is genuinely specific: spend five minutes with the product, the documentation or the public repository, and write one sentence about something concrete you noticed.',
        'One accurate sentence — a feature that surprised you, a decision in their API you have opinions about, a problem you recognise from your own work — does more than three paragraphs of generated enthusiasm, because it could not have been written about anyone else.',
        'Five minutes times twenty applications is under two hours, which is the point at which this stops being advice and becomes arithmetic. It does not scale to a hundred, and that is the actual argument against a hundred.',
      ],
    },
    {
      heading: 'A hundred is the wrong target',
      paragraphs: [
        'The volume is the problem rather than the automation. Ten applications, each personalised where personalisation is real, outperform a hundred that vary without being specific.',
        'If a search genuinely needs a hundred applications, send them without pretending each one is a considered expression of interest. An honest short application is better received than an elaborate one that nobody believes.',
        'Where a cover letter is optional and you have nothing specific to say, omitting it is a legitimate choice. A strong CV with no letter reads as efficient; a strong CV with a hollow letter reads as someone who thought the reader would not notice.',
      ],
    },
    {
      heading: 'Where the effort actually belongs',
      paragraphs: [
        'The parts of an application that get read carefully are the free-text answers and the CV’s relevance to the specific role. Those are worth real attention.',
        'Automate the mechanics and the requirement mapping. Reserve your own thinking for the few applications where it will change the outcome — that is a hundred times more valuable than spreading it across a hundred.',
        'Treat it as a budget rather than a rule. You have a fixed number of hours this week; the question is not whether to automate but which ten applications get the part of you that a system cannot supply.',
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
    {
      q: 'Is there a quick test for whether something is really personalised?',
      a: 'Remove the company name and the requirement list. If what remains would work for any employer in the sector, it was varied rather than personalised.',
    },
    {
      q: 'What is the cheapest genuinely specific thing to add?',
      a: 'Five minutes with the product or repository and one accurate sentence about something concrete. It could not have been written about anyone else, which is the whole point.',
    },
  ],
  related: ['how-to-build-an-ai-job-application-personalization-engine', 'can-ai-apply-to-100-jobs-a-day', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;

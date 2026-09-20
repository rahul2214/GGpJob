import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-companies-use-ai-in-hiring',
  tint: 'indigo',
  title: 'How Companies Use AI to Screen Job Applicants',
  heading: 'How companies use AI to screen applicants',
  description:
    'How companies use AI in hiring — resume screening, ranking, video interviews — what it means for your application, and how to get through it.',
  keywords: [
    'how companies use ai in hiring',
    'ai resume screening',
    'ai in recruitment',
    'does ai read my resume',
    'ai interview screening',
    'automated resume screening',
    'ai hiring bias',
    'how to pass ai screening',
  ],
  publishedAt: '2026-09-08',
  updatedAt: '2026-09-08',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'AI & Hiring',
  anchors: ['AI in hiring', 'resume screening'],
  excerpt:
    'Your application is read by software before a person sees it. Knowing exactly what that software does changes how you should write it.',
  keyTakeaways: [
    'You are rarely rejected by an algorithm — you are more often never surfaced, which is fixable.',
    'Parsing and vocabulary matching decide more than most candidates realise.',
    'Knockout questions on the form are the part that genuinely auto-rejects.',
    'Bias is a real concern you cannot control; the mechanical part is the part you can.',
    'Two minutes checking your CV against the posting beats another hour of formatting.',
  ],
  sections: [
    {
      heading: 'What is actually automated',
      paragraphs: [
        'The common fear is a machine rejecting you outright. The reality is usually less dramatic and more consequential: software parses your resume into structured fields, then ranks or filters candidates so a recruiter reviews a shortlist rather than nine hundred applications.',
        'You are rarely rejected by an algorithm. You are more often simply not surfaced — which has the same effect while being far easier to fix, because it is a visibility problem rather than a judgement about you.',
        'The distinction changes what you should do. If you believe a score is gating you, you try to game a number nobody computes. If you understand that a recruiter is running a search over parsed fields, you make sure you appear in it — a concrete, checkable goal.',
      ],
    },
    {
      heading: 'The stages where AI appears',
      paragraphs: [
        'Different employers automate different amounts, but the sequence is fairly consistent across mid-size and large companies.',
        'The amount of automation correlates with applicant volume rather than with company sophistication. A small firm receiving four hundred applications for one role automates more aggressively than a large one hiring for a specialism nobody applies to.',
      ],
      bullets: [
        'Parsing — extracting your details, employers, dates and skills into a database',
        'Matching and ranking — scoring against the job description so recruiters review a shortlist',
        'Knockout questions — hard filters on work authorisation, location or experience thresholds',
        'Assessments and asynchronous video, sometimes with automated scoring',
        'Scheduling and messaging, which is now largely automated',
      ],
      table: {
        caption: 'What each automated stage does, and what you can influence',
        columns: ['Stage', 'What it decides', 'What you control'],
        rows: [
          ['Parsing', 'Whether your history is readable at all', 'Layout, file format, headings'],
          ['Search and ranking', 'Whether you appear on the shortlist', 'Vocabulary matching the posting'],
          ['Knockout questions', 'Immediate elimination', 'Reading the form carefully'],
          ['Assessments', 'Progression to interview', 'Preparation and practice'],
          ['Scheduling', 'Speed, not outcome', 'Responding quickly'],
        ],
      },
    },
    {
      heading: 'What this means for your application',
      paragraphs: [
        'Two things matter far more than they intuitively should. First, whether your resume parses correctly — a multi-column layout, a table, or contact details in the page header can make your work history invisible to the system regardless of how strong it is.',
        'Second, whether your vocabulary matches the posting. If the job says "PostgreSQL" and you wrote "SQL databases", a keyword search will not return you. That is not dishonesty on either side; it is two words for one thing, and the search does not know it.',
        'Both are mechanical problems with mechanical fixes, which is the encouraging part. They are also invisible from the outside: nothing in a rejection tells you that your experience section never made it into the database.',
      ],
    },
    {
      heading: 'The part that genuinely rejects you automatically',
      paragraphs: [
        'Knockout questions are where automatic elimination actually happens, and they sit on the application form rather than in the resume parser. Right to work, minimum years with a named technology, required licences, location and start date are all configured by the employer and applied before any human sees anything.',
        'These are answered carelessly more often than you would expect. A question asking for years of experience with one specific tool is narrower than total career length, and an answer given quickly is not recoverable once submitted.',
        'Read the form as carefully as the posting. It is the one place in the process where a single wrong click ends the application regardless of everything else you did.',
      ],
    },
    {
      heading: 'What about bias',
      paragraphs: [
        'It is a legitimate concern. Systems trained on historical hiring decisions can reproduce historical patterns, and there have been well-documented cases of exactly that. Regulation is tightening in several jurisdictions, and some employers now audit these tools.',
        'As a candidate you cannot fix this, and it is worth being clear-eyed rather than reassured. What you can control is the mechanical part — that your application parses cleanly and uses the vocabulary being searched for — which is where most avoidable losses occur.',
        'A growing number of jurisdictions require employers to disclose automated screening and, in some cases, to offer human review on request. Where that applies, asking is reasonable and is not held against you, though the rules differ enough that it is worth checking what applies locally.',
      ],
    },
    {
      heading: 'What automation has genuinely improved',
      paragraphs: [
        'It is worth acknowledging the other side. Before automation, a recruiter facing four hundred applications read perhaps the first eighty. Everyone after that was rejected by arrival order, which is not a fairer process than a search over parsed fields.',
        'Response rates have improved too. Automated status updates and scheduling remove much of the silence candidates used to experience, and applications now get acknowledged at volumes where that was previously impossible.',
        'The realistic view is that automation replaced one arbitrary filter with a different one that is at least consistent and, unlike arrival order, something you can prepare for.',
      ],
      example: {
        title: 'Two candidates, one filter',
        paragraphs: [
          'Both have six years of relevant backend experience. Candidate A uses a two-column template with contact details in the header and describes their work as "relational databases and cloud infrastructure". Candidate B uses a single column and writes "PostgreSQL", "AWS" and "Kubernetes" in a plain skills line, because the posting named all three.',
          'The recruiter searches PostgreSQL and Kubernetes. Candidate B appears; Candidate A does not, and their employment history was partially scrambled by the column layout anyway.',
          'Neither was assessed. One was findable and one was not, and the difference took about ten minutes to fix.',
        ],
      },
    },
    {
      heading: 'Getting through it',
      paragraphs: [
        'Use a single-column, parse-safe layout with standard section headings, mirror the posting’s terminology where it genuinely applies to you, and export a text-based PDF. Then check the result against the actual job description before submitting.',
        'Two minutes of that per application does more for your odds than another hour of formatting, because it targets the specific mechanism that is filtering you out.',
        'And remember that a referral bypasses most of this. A referred application is read by a person; a cold one has to survive a search first. Where you have any route to one, it is worth more than any amount of resume optimisation.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Does AI actually read my resume?',
      a: 'Software parses it into structured fields and ranks it against the job description so recruiters review a shortlist. Outright automated rejection is less common than simply never appearing in the recruiter search.',
    },
    {
      q: 'How do I pass AI resume screening?',
      a: 'Use a single-column, parse-safe layout with standard headings, mirror the exact terminology from the posting where it is true of you, and export a text-based PDF rather than a scan or image.',
    },
    {
      q: 'Is AI hiring biased?',
      a: 'It can be, since systems trained on past hiring decisions can reproduce past patterns, and documented cases exist. Regulation is tightening and some employers audit their tools, but as a candidate the controllable part is making sure your application parses and matches.',
    },
    {
      q: 'What actually auto-rejects an application?',
      a: 'Knockout questions on the form — right to work, minimum years with a named tool, licences, location. They are applied before any human sees the application and a careless answer is not recoverable.',
    },
    {
      q: 'Can I ask for a human to review my application?',
      a: 'In a growing number of jurisdictions employers must disclose automated screening and sometimes offer human review on request. Rules differ, so check what applies locally, but asking is reasonable.',
    },
    {
      q: 'Has automated screening made hiring worse for candidates?',
      a: 'Mixed. It replaced arrival-order rejection, which was not fairer, and it improved acknowledgement and scheduling. The filter is now consistent, which at least makes it something you can prepare for.',
    },
  ],
  related: ['how-applicant-tracking-systems-work', 'ai-resume-writing-guide', 'how-to-build-an-ai-ats-scoring-system'],
  references: [
    {
      title: 'AI Risk Management Framework',
      url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      publisher: 'NIST',
      note: 'The framework most AI governance programmes are structured around.',
    },
    {
      title: 'JobPosting schema',
      url: 'https://schema.org/JobPosting',
      publisher: 'Schema.org',
      note: 'The vocabulary job data is structured with across the web.',
    },
    {
      title: 'Job posting structured data',
      url: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
      publisher: 'Google for Developers',
      note: 'What employers are expected to publish, and how it is read.',
    },
  ],
};

export default post;

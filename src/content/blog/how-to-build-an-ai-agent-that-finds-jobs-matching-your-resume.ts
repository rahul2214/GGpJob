import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-finds-jobs-matching-your-resume',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Finds Jobs Matching Your Resume',
  heading: 'Finding jobs from a CV',
  description:
    'Turning a CV into effective searches: deriving queries, searching several sources, handling the seniority trap, and knowing when the CV is the wrong input.',
  keywords: [
    'find jobs matching resume',
    'cv based job search',
    'query generation from resume',
    'seniority mismatch',
    'multi source job search',
    'job discovery agent',
    'resume driven search',
    'ai job finder',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A CV describes where someone has been. Searching from it alone finds more of the same, which is not always what they want.',
  sections: [
    {
      heading: 'Derive searches, do not search with the CV',
      paragraphs: [
        'Job search APIs take queries, not documents. The agent’s first task is turning a CV into a small set of good searches — role titles the person could plausibly hold, with the location and seniority constraints attached.',
        'Generate several rather than one. A single canonical title misses the variants employers actually use, and job title vocabulary is inconsistent enough that three or four related searches materially change what is found.',
      ],
      bullets: [
        'Current and adjacent role titles, including common variants',
        'Core technologies or domains as separate search terms',
        'Location and remote constraints applied as filters',
        'A seniority band, derived and then confirmed',
      ],
    },
    {
      heading: 'The seniority trap',
      paragraphs: [
        'CV text and posting text match most strongly when they describe the same technologies, which happens across every level. A junior CV looks textually similar to a staff-level posting in the same area, and similarity-based search cheerfully returns it.',
        'Derive the seniority band explicitly from years, scope and responsibility, confirm it with the candidate, and filter on it. Leaving it to the matching layer produces recommendations that waste everyone’s time.',
      ],
    },
    {
      heading: 'Search several sources, then reconcile',
      paragraphs: [
        'No single source has everything. Aggregators have breadth with stale entries, employer career pages have accuracy without breadth, and specialist boards carry roles that never appear elsewhere.',
        'Query several, then deduplicate by employer and role rather than by URL — the same posting appears with different links across aggregators. Prefer the employer’s own page as the canonical record when one exists.',
      ],
    },
    {
      heading: 'Ask what they want, because the CV cannot say',
      paragraphs: [
        'A CV records history and says nothing about intent. Someone may be leaving the field it describes, looking for less responsibility, or wanting to use one skill from it and none of the others.',
        'Searching purely from the document therefore optimises for continuity, which is exactly wrong for the people most in need of help. Take an explicit target and weight it above anything derived from the history.',
      ],
    },
    {
      heading: 'Explain each result',
      paragraphs: [
        'A list of postings with no stated reason reads as generic, and candidates dismiss the whole set when two look irrelevant. One line of explanation changes how the same list is received.',
        '"Matched on your work with X at Y" also exposes bad matching. If the explanation reads as thin, the match was thin, and that is information you want before the candidate finds it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can a job search API take a CV directly?',
      a: 'No — they take queries. The agent has to derive several searches from the CV: plausible role titles and variants, core technologies, location and a seniority band.',
    },
    {
      q: 'Why do CV-based searches return the wrong level?',
      a: 'Because CV and posting text match on shared technologies, which appear at every level. Derive seniority explicitly from years and scope, confirm it, and filter on it.',
    },
    {
      q: 'Should the agent search more than one source?',
      a: 'Yes. Aggregators have breadth with stale entries and employer pages have accuracy without breadth. Deduplicate by employer and role, not URL.',
    },
    {
      q: 'What does a CV fail to tell the agent?',
      a: 'Intent. Someone may be leaving the field their CV describes, so searching purely from it optimises for continuity — wrong for exactly the people who need most help.',
    },
  ],
  related: ['how-to-build-an-ai-job-finder-using-job-apis', 'how-to-build-an-ai-agent-that-finds-jobs-from-multiple-websites', 'how-to-match-a-resume-with-a-job-description'],
};

export default post;

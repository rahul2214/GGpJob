import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'gcc-jobs-in-india',
  tint: 'amber',
  title: 'GCC Jobs in India: What Global Capability Centres Actually Offer',
  heading: 'GCC jobs in India',
  description:
    'What a Global Capability Centre is, how GCC roles differ from IT services and product companies, what they pay for, and how to judge whether one suits you.',
  keywords: [
    'gcc jobs in india',
    'global capability centre',
    'gcc vs it services',
    'gcc companies india',
    'gcc careers',
    'captive centre jobs india',
    'gcc salary india',
    'gcc hiring',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Global Careers',
  anchors: ['Global Capability Centre', 'GCC roles'],
  excerpt:
    'GCCs became one of the largest employers of senior technical talent in India. The label covers very different realities, and telling them apart matters.',
  keyTakeaways: [
    'In a GCC you are employed by the global company itself, not by a vendor deploying you to clients.',
    'GCC is a structural label, not a quality guarantee — ownership varies enormously between centres.',
    'Ask questions whose answers cannot be rehearsed; specificity is the tell for genuine ownership.',
    'Working hours are the cost discussed too late. Ask when meetings actually happen.',
    'Describe what you owned and what changed, not which team you sat in.',
  ],
  sections: [
    {
      heading: 'What a GCC actually is',
      paragraphs: [
        'A Global Capability Centre is a company’s own offshore office rather than a vendor. If you join one you are employed by the global company, working on its products, reporting into its structure. This is the essential difference from IT services, where you are employed by a vendor and deployed to a client.',
        'That distinction drives nearly everything else — what you work on, how long you work on it, who evaluates you and what your experience looks like to a future employer.',
        'The category has also broadened considerably. Centres that began as support and maintenance functions now include ones running entire product lines, and the label alone no longer tells you which kind you are looking at.',
      ],
    },
    {
      heading: 'How this differs from IT services',
      paragraphs: [
        'In services, the client can change, the technology can change and the work is scoped by a contract. That variety suits some people and produces broad exposure, but it can also mean repeatedly rebuilding context and rarely owning anything long enough to see consequences.',
        'In a GCC you generally stay with one product area for years. You see decisions play out, inherit your own choices and develop genuine depth. For engineers who want ownership rather than throughput, this is the main attraction.',
        'Neither is better in the abstract. Services suits people who want breadth, client exposure and faster early progression through defined grades; a GCC suits people who want to live with the consequences of their own architecture. The mismatch happens when someone joins one wanting what the other provides.',
      ],
      bullets: [
        'Employer — the global company, not a vendor',
        'Work — one product area over years, not rotating engagements',
        'Evaluation — internal performance systems, not billable utilisation',
        'Progression — the global company’s ladder, sometimes including relocation',
        'Technology — whatever the product needs, including legacy parts of it',
      ],
      table: {
        caption: 'GCC, IT services and product companies compared',
        columns: ['', 'GCC', 'IT services', 'Product company'],
        rows: [
          ['Who employs you', 'The global company', 'A vendor', 'The product company'],
          ['Time on one area', 'Years', 'Months to a year', 'Years'],
          ['Measured by', 'Performance review', 'Utilisation and delivery', 'Product outcomes'],
          ['Decision authority', 'Varies widely', 'Low, scoped by contract', 'Usually high'],
          ['Hours overlap', 'Often significant', 'Depends on client', 'Usually local'],
        ],
      },
    },
    {
      heading: 'The quality spread is wide',
      paragraphs: [
        'The most useful thing to understand is that GCC is a structural label, not a quality guarantee. Some centres own products end to end, with architecture and roadmap authority sitting locally. Others are execution arms where design decisions arrive from elsewhere and the local remit is implementation.',
        'Both are legitimate employment, but they are very different jobs and the job description will not distinguish them. The difference shows up in whether you are building judgement or building output.',
        'The consequence compounds over years. Someone who has made architectural decisions and lived with them has a different CV after five years from someone who has implemented decisions made elsewhere, even if the logos and the technologies are identical.',
      ],
    },
    {
      heading: 'How to tell which one you are interviewing with',
      paragraphs: [
        'Ask questions whose answers cannot be rehearsed. Where does the roadmap for this area get decided? Who was the last person promoted into a principal or staff role, and were they hired locally? What was the most recent significant technical decision the team made without headquarters approval?',
        'Listen for specificity. A centre with real ownership answers with names, examples and dates. One without will answer in generalities about collaboration and global alignment, which is a reliable tell.',
        'On-call is the most honest single signal. Teams that are woken when their systems fail generally have the authority to change them, because nobody accepts responsibility for a system they cannot modify for long.',
      ],
      bullets: [
        'Who decides the roadmap for this team, specifically?',
        'What time do most meetings with headquarters happen?',
        'Was the last senior promotion someone hired here?',
        'What was the last architecture decision made locally?',
        'Does this team own the on-call rota for what it builds?',
      ],
    },
    {
      heading: 'Compensation and the hours question',
      paragraphs: [
        'GCC compensation generally sits above IT services for equivalent experience and below what a comparable role pays at headquarters. The gap narrows as seniority rises and is smallest in specialised areas where local supply is thin.',
        'The cost that is discussed too late is working hours. Overlap with headquarters determines how much of your evening belongs to your employer. A centre aligned with a distant time zone can mean a permanent late shift, which is sustainable for some people and corrosive for others. Ask about actual meeting times before accepting, not after.',
        'Ask specifically rather than generally. "Is there flexibility?" gets a yes from everyone; "what time did this team’s meetings start last week?" gets an answer you can plan a life around.',
      ],
      example: {
        title: 'The same offer, two different lives',
        paragraphs: [
          'Centre A aligns with a European headquarters. Overlap runs from early afternoon, most meetings land between two and six, and evenings are generally free. The commitment is real and bounded.',
          'Centre B aligns with a west-coast American headquarters. Meaningful overlap begins at nine in the evening local time, stand-ups are at ten, and anything requiring a decision from headquarters waits until then. On paper both roles are "some overlap with the global team".',
          'The compensation difference between the two might be ten per cent. The difference in what your weekday evenings look like for the next three years is considerably larger, and only one of these is visible in a job description.',
        ],
      },
    },
    {
      heading: 'What it does for your CV',
      paragraphs: [
        'GCC experience generally reads well, particularly with a recognisable global employer and a clear product area. It signals sustained ownership rather than rotating assignments, which is what senior hiring looks for.',
        'To make it count, be able to describe what you owned and what changed because of your work. "I worked in the payments team at a global retailer" is weaker than "I owned the reconciliation service, cut settlement failures by a third, and led the migration". The second is the version that opens doors, including international ones.',
        'Keep a private record as you go. Specific numbers, dates and decisions are easy to capture at the time and close to impossible to reconstruct three years later, and they are exactly what separates a strong CV from a list of team names.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between a GCC and an IT services company?',
      a: 'In a GCC you are employed by the global company itself and work on its own products, usually for years. In IT services you are employed by a vendor and deployed to clients, with engagements and technologies that change.',
    },
    {
      q: 'Do GCCs pay better than IT services companies?',
      a: 'Generally yes for equivalent experience, and generally less than a comparable role at headquarters. The gap narrows with seniority and is smallest in specialised areas where local supply is limited.',
    },
    {
      q: 'How do I know whether a GCC has real ownership?',
      a: 'Ask who decides the roadmap, when the last senior promotion of a locally hired person happened, and what significant technical decision the team made without headquarters approval. Specific answers indicate real ownership; generalities indicate an execution centre.',
    },
    {
      q: 'Can a GCC role lead to an international move?',
      a: 'Sometimes — internal transfers are a common route because you are already an employee of the global company. It depends heavily on the employer, so ask for concrete examples of people who have done it rather than whether it is possible in principle.',
    },
    {
      q: 'What is the single best question to ask in a GCC interview?',
      a: 'Whether the team owns the on-call rota for what it builds. Teams woken by their own systems generally have authority to change them, because responsibility without control does not last.',
    },
    {
      q: 'How do I find out about working hours before accepting?',
      a: 'Ask what time that team meetings started last week, not whether there is flexibility. The first gets a specific answer; the second gets a yes from everyone.',
    },
  ],
  related: ['international-jobs-from-india', 'remote-tech-jobs', 'how-to-get-a-gcc-job-without-experience'],
};

export default post;

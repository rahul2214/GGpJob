import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-applicant-tracking-systems-work',
  tint: 'emerald',
  title: 'How Does an ATS Work? And How to Beat It',
  heading: 'How applicant tracking systems actually work',
  description:
    'How an applicant tracking system reads your resume, why strong candidates get filtered out, and the formatting and keyword rules that get you past the screen.',
  keywords: [
    'how does an ats work',
    'applicant tracking system',
    'how to beat ats',
    'ats resume tips',
    'ats friendly resume format',
    'ats resume checker',
    'resume keywords',
    'why is my resume rejected',
    'ats score meaning',
  ],
  publishedAt: '2026-09-07',
  updatedAt: '2026-09-07',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Resumes & ATS',
  anchors: ['applicant tracking system', 'applicant tracking systems', 'how an ATS reads'],
  excerpt:
    'Most rejections are not judgements. They are parsing failures — and parsing failures are entirely fixable once you know what the software is doing.',
  keyTakeaways: [
    'An ATS is a searchable database with a parser attached, not a judge that scores and rejects you.',
    'The realistic failure is invisibility: your resume parsed badly or lacks the words a recruiter searched for.',
    'Single column, standard headings, contact details in the body, text-based PDF — that combination parses everywhere.',
    'Knockout questions on the application form do auto-reject. The resume parser generally does not.',
    'Mirror the posting’s vocabulary only where it is genuinely true of you; stuffing is visible and counterproductive.',
  ],
  sections: [
    {
      heading: 'What an ATS is, and what it is not',
      paragraphs: [
        'An applicant tracking system is fundamentally a database with a parser attached. It ingests your resume, tries to extract structured fields — name, contact details, employers, dates, titles, skills, education — and stores the result so recruiters can search and filter.',
        'It is worth correcting a persistent myth: mainstream systems do not assign a secret score and auto-reject below a threshold. What actually happens is more mundane and, in practice, worse. A recruiter searches for the skills they need, and you either appear in the results or you do not.',
        'That reframes the problem. You are not trying to satisfy an algorithm. You are trying to be findable, and to be parsed correctly enough that your experience is legible when a human does open the file.',
        'The distinction matters because it changes what you should spend time on. If you believe a score is gating you, you optimise for a number nobody is computing. If you understand that a recruiter is running a search, you optimise for appearing in it — which is a concrete, checkable goal.',
      ],
    },
    {
      heading: 'What the recruiter actually does with it',
      paragraphs: [
        'Once a posting closes, or while it is still open, a recruiter working through a few hundred applications does not read them in order. They run searches against the parsed fields — a required technology, a qualification, a location, a seniority band — and work through whoever comes back.',
        'Those searches are usually narrower than the job description. A posting may list fifteen requirements, and the recruiter searches on the two or three that are genuinely non-negotiable. Everyone who does not surface for those two or three is, for practical purposes, not in the process at all.',
        'This is why a resume can be excellent and still produce silence. It was never rejected; it was never retrieved. And nothing in the process tells you which of the two happened, which is what makes the experience so opaque from the outside.',
      ],
      example: {
        title: 'What this looks like in practice',
        paragraphs: [
          'A backend engineer with six years of Postgres experience applies to a role asking for PostgreSQL. Their resume says "relational databases" throughout and names Postgres once, inside a project description in the final third of the document.',
          'The recruiter searches "PostgreSQL". The parser did capture the word, but the skills field — which is what the search is weighted towards — contains only "relational databases". The candidate ranks below people with far less experience who happened to write the product name in their skills list.',
        ],
      },
    },
    {
      heading: 'Why strong candidates get filtered out',
      paragraphs: [
        'The most common cause is parsing failure, not competence. If your work history sits inside a table, a text box, or a two-column layout, many parsers read it in the wrong order or drop it altogether. Contact details placed in the document header are routinely invisible.',
        'The second cause is vocabulary mismatch. If a posting asks for "React" and your resume says "front-end frameworks", a keyword search will not surface you. That is not dishonesty on either side; it is two different words for the same thing, and the search does not know that.',
        'A third, quieter cause is date formatting. Parsers use dates to compute how long you spent in each role and how recent your experience is. Inconsistent or ambiguous formats — "03/04/2024" means two different months depending on where you are — produce a garbled work history that undercuts your seniority without anyone noticing.',
      ],
      bullets: [
        'Multi-column layouts that scramble reading order',
        'Tables and text boxes the parser skips entirely',
        'Contact details in a header or footer region',
        'Scanned or image-based PDFs with no text layer',
        'Non-standard section names like "My Journey" instead of "Experience"',
        'Skills present in the role but absent from the wording',
        'Inconsistent date formats that garble the computed timeline',
      ],
    },
    {
      heading: 'The format that reliably parses',
      paragraphs: [
        'The rules are boring, which is the point. A single-column, reverse-chronological layout with conventional section headings parses correctly in essentially every system in common use.',
        'Export as a text-based PDF unless the posting explicitly asks for .docx. You can verify the text layer in ten seconds: open the PDF, try to select your name with the cursor. If it does not highlight as text, no parser can read it either.',
        'Design restraint is not a stylistic preference here. Every graphical element that carries meaning — a skills bar chart, an icon standing in for a section heading, a sidebar of contact details — is information the parser cannot recover. If removing the styling would lose content, the styling was doing work it should not have been doing.',
      ],
      table: {
        caption: 'Resume formatting choices and how a parser handles each',
        columns: ['Element', 'What the parser does', 'Use instead'],
        rows: [
          ['Two-column layout', 'Reads across columns, scrambling the order', 'Single column, top to bottom'],
          ['Contact details in header', 'Often skips the header region entirely', 'First lines of the document body'],
          ['Skills in a table', 'May drop the table or flatten it wrongly', 'A comma-separated line under a Skills heading'],
          ['Skill rating bars', 'Sees a graphic, extracts nothing', 'Plain text, with context in the role bullets'],
          ['Scanned or exported image PDF', 'Finds no text layer at all', 'Text-based PDF export'],
          ['Headings like "My Journey"', 'Fails to map it to a known section', 'Experience, Skills, Education'],
        ],
      },
    },
    {
      heading: 'Getting the keywords right without stuffing',
      paragraphs: [
        'Mirror the job description’s own vocabulary where it is genuinely true of you. If it says "PostgreSQL" and you wrote "SQL databases", change it. If it names a methodology you have actually worked in, use their term for it.',
        'Keyword stuffing — hidden white text, a wall of unrelated technologies — is both easy to spot and counterproductive. Recruiters do open the file, and a skills section listing forty technologies signals nothing except padding. Depth in the handful that match the role is far more persuasive.',
        'The reliable technique is additive rather than substitutive. Write the phrase you would naturally use and the phrase the posting uses, in the same sentence, where both are accurate: "built and operated ETL data pipelines" satisfies a literal search for ETL and still reads like a person wrote it.',
        'Where you genuinely lack a required skill, the honest move is to leave it out. A keyword you cannot defend gets you into a technical conversation you will lose, which costs more than the application would have.',
      ],
    },
    {
      heading: 'The screening that does auto-reject',
      paragraphs: [
        'There is one place in the process where automatic rejection is real, and it is not the resume parser. Application forms frequently include knockout questions: do you have the right to work here, do you hold this licence, do you have at least this many years of experience, can you work from this location.',
        'Answering one of those the wrong way can remove you from consideration immediately, regardless of how good the rest of the application is. These are configured by the employer, they are binary, and they are applied before a human sees anything.',
        'The practical implication is to read the form as carefully as the posting. A question about years of experience with a specific technology is asking something narrower than total career length, and an answer given carelessly is not recoverable later.',
      ],
      bullets: [
        'Right-to-work and sponsorship questions',
        'Minimum years of experience with a named skill',
        'Required licences, clearances or certifications',
        'Location and on-site availability',
        'Notice period and earliest start date',
      ],
    },
    {
      heading: 'How to check before you apply',
      paragraphs: [
        'Rather than guessing, compare your resume against the specific posting. A checker parses both documents the way an ATS would, surfaces the required skills that are missing from your resume, and shows which sections are thin.',
        'Two minutes of that before submitting is worth more than another hour of formatting. Once the gaps are visible, closing them is usually a matter of rewording things you have genuinely done.',
        'There is also a free version of this test you can run yourself. Copy the text out of your own PDF and paste it into a plain text editor. What you see is approximately what the parser sees — and if the order is wrong, a section is missing, or your phone number has vanished, you have found the problem before an employer did.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a good ATS score?',
      a: 'Aim for 80 or above against the specific job description. Between 70 and 79 usually clears the initial filter but leaves keyword gaps worth closing. Below 70 generally means the resume is unlikely to surface in a recruiter search for that role.',
    },
    {
      q: 'Should I send a PDF or a Word document?',
      a: 'A text-based PDF is the safe default — it preserves layout and every modern system parses it. Send .docx only when the posting or portal explicitly asks. Never send a scanned or image-based PDF; it has no text layer to read.',
    },
    {
      q: 'Do applicant tracking systems automatically reject resumes?',
      a: 'The resume parser generally does not. Knockout questions on the application form do — right to work, minimum experience, required licences — and those are applied before any human sees the application.',
    },
    {
      q: 'Does a one-page resume matter?',
      a: 'Less than people think, and not for parsing at all. One page suits early-career candidates; two is entirely normal with several years of experience. Relevance matters far more than length.',
    },
    {
      q: 'How can I tell what the ATS actually read from my resume?',
      a: 'Copy the text out of your own PDF and paste it into a plain text editor. That is roughly what the parser sees. If sections are out of order, missing, or your contact details have disappeared, you have found the failure yourself.',
    },
    {
      q: 'Will a template from a design site get me rejected?',
      a: 'Not rejected, but frequently unparsed. Two-column templates, sidebars and skill rating bars are the most common causes of scrambled or missing work history, because the visual layout carries information the parser cannot recover.',
    },
    {
      q: 'Should I tailor my resume for every application?',
      a: 'The keyword layer, yes — it is what determines whether you surface in the recruiter search. The underlying facts should never change. Adjusting emphasis and vocabulary per posting is reasonable; inventing experience is not.',
    },
  ],
  related: ['ai-resume-writing-guide', 'how-to-use-ai-for-job-search', 'how-to-build-an-ai-ats-resume-scorer'],
  references: [
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

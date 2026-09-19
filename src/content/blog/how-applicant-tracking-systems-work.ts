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
  excerpt:
    'Most rejections are not judgements. They are parsing failures — and parsing failures are entirely fixable once you know what the software is doing.',
  sections: [
    {
      heading: 'What an ATS is, and what it is not',
      paragraphs: [
        'An applicant tracking system is fundamentally a database with a parser attached. It ingests your resume, tries to extract structured fields — name, contact details, employers, dates, titles, skills, education — and stores the result so recruiters can search and filter.',
        'It is worth correcting a persistent myth: mainstream systems do not assign a secret score and auto-reject below a threshold. What actually happens is more mundane and, in practice, worse. A recruiter searches for the skills they need, and you either appear in the results or you do not.',
        'That reframes the problem. You are not trying to satisfy an algorithm. You are trying to be findable, and to be parsed correctly enough that your experience is legible when a human does open the file.',
      ],
    },
    {
      heading: 'Why strong candidates get filtered out',
      paragraphs: [
        'The most common cause is parsing failure, not competence. If your work history sits inside a table, a text box, or a two-column layout, many parsers read it in the wrong order or drop it altogether. Contact details placed in the document header are routinely invisible.',
        'The second cause is vocabulary mismatch. If a posting asks for "React" and your resume says "front-end frameworks", a keyword search will not surface you. That is not dishonesty on either side; it is two different words for the same thing, and the search does not know that.',
      ],
      bullets: [
        'Multi-column layouts that scramble reading order',
        'Tables and text boxes the parser skips entirely',
        'Contact details in a header or footer region',
        'Scanned or image-based PDFs with no text layer',
        'Non-standard section names like "My Journey" instead of "Experience"',
        'Skills present in the role but absent from the wording',
      ],
    },
    {
      heading: 'The format that reliably parses',
      paragraphs: [
        'The rules are boring, which is the point. A single-column, reverse-chronological layout with conventional section headings parses correctly in essentially every system in common use.',
        'Export as a text-based PDF unless the posting explicitly asks for .docx. You can verify the text layer in ten seconds: open the PDF, try to select your name with the cursor. If it does not highlight as text, no parser can read it either.',
      ],
      bullets: [
        'One column, no tables, no text boxes, no graphics carrying information',
        'Standard headings: Summary, Skills, Experience, Projects, Education',
        'Contact details in the body, not the header',
        'Dates in a consistent format such as "Mar 2023 – Present"',
        'A standard font and a text-based PDF export',
      ],
    },
    {
      heading: 'Getting the keywords right without stuffing',
      paragraphs: [
        'Mirror the job description\'s own vocabulary where it is genuinely true of you. If it says "PostgreSQL" and you wrote "SQL databases", change it. If it names a methodology you have actually worked in, use their term for it.',
        'Keyword stuffing — hidden white text, a wall of unrelated technologies — is both easy to spot and counterproductive. Recruiters do open the file, and a skills section listing forty technologies signals nothing except padding. Depth in the handful that match the role is far more persuasive.',
      ],
    },
    {
      heading: 'How to check before you apply',
      paragraphs: [
        'Rather than guessing, compare your resume against the specific posting. A checker parses both documents the way an ATS would, surfaces the required skills that are missing from your resume, and shows which sections are thin.',
        'Two minutes of that before submitting is worth more than another hour of formatting. Once the gaps are visible, closing them is usually a matter of rewording things you have genuinely done.',
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
      a: 'Mainstream systems do not auto-reject on a hidden score. The realistic failure mode is that your resume parses badly or lacks the vocabulary a recruiter searches for, so it never appears in their results — functionally a rejection, but a fixable one.',
    },
    {
      q: 'Does a one-page resume matter?',
      a: 'Less than people think, and not for parsing at all. One page suits early-career candidates; two is entirely normal with several years of experience. Relevance matters far more than length.',
    },
  ],
  related: ['ai-resume-writing-guide', 'how-to-use-ai-for-job-search'],
};

export default post;

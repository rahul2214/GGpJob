/**
 * Shared SEO copy for the ATS checker and resume builder pages.
 *
 * This module has no "use client" directive on purpose: the server components
 * that emit the FAQPage / HowTo JSON-LD and the client components that render
 * the visible accordions both import from here, so the structured data can
 * never drift from what is actually on the page. Exporting this data from a
 * client module instead would hand the server a client reference rather than
 * the array, and `.map()` over it would throw at request time.
 */

export interface FaqEntry {
  q: string;
  a: string;
}

export const ATS_FAQS: FaqEntry[] = [
  {
    q: "What is an ATS score?",
    a: "An ATS (Applicant Tracking System) score indicates how well your resume matches a job description. Most companies use ATS software to filter applications before a human reviews them. A score above 70% significantly increases your chances of passing the initial screen."
  },
  {
    q: "Is this ATS checker really free?",
    a: "Yes, your first ATS analysis on JobsDart is completely free. Subsequent analyses cost 1 credit each."
  },
  {
    q: "What file formats does the resume checker support?",
    a: "Currently supports PDF files up to 2MB. ATS systems work best with text-based PDFs, not scanned images."
  },
  {
    q: "How do I check my resume ATS score online?",
    a: "Upload your resume as a PDF, paste the job description you are targeting, and run the scan. JobsDart parses both documents, compares required skills and keywords against your resume, and returns an ATS compatibility score out of 100 with a section-by-section breakdown in a few seconds."
  },
  {
    q: "What is a good ATS score for a resume?",
    a: "Aim for 80 or above. A score between 70 and 79 usually clears the initial filter but leaves keyword gaps worth closing, while anything under 70 means the resume is likely to be screened out before a recruiter reads it."
  },
  {
    q: "How can I make my resume ATS-friendly?",
    a: "Use a single-column layout with standard section headings (Experience, Education, Skills), mirror the exact keywords and job title from the job description, quantify achievements with numbers, avoid tables, text boxes, headers, footers and graphics, and export as a text-based PDF rather than a scanned image."
  },
  {
    q: "Does this ATS checker work for freshers and Indian job portals?",
    a: "Yes. The analyzer works for freshers, entry-level and experienced profiles, and checks the formatting and keyword density conventions used by corporate applicant tracking systems as well as portals like Naukri and LinkedIn."
  }
];

export const RESUME_BUILDER_FAQS: FaqEntry[] = [
  {
    q: "Is the JobsDart resume builder free?",
    a: "Yes. You can build, preview and download your first resume for free. Additional AI rewrites and extra resume versions cost 1 credit each, and new accounts start with free credits."
  },
  {
    q: "Are the resume templates ATS-friendly?",
    a: "Every template uses a single-column, parse-safe layout with standard section headings, selectable text and no tables, text boxes or images that applicant tracking systems fail to read. The exported PDF keeps the text layer intact so an ATS can extract your experience correctly."
  },
  {
    q: "How do I make a resume for freshers with no experience?",
    a: "Lead with education, then projects, internships and technical skills. Describe each project with the tools you used and a measurable outcome, and mirror the keywords from the job description you are targeting. The AI writer turns short notes into quantified, recruiter-ready bullet points."
  },
  {
    q: "Can I download my resume as a PDF?",
    a: "Yes. Export a print-quality, ATS-safe PDF that typically stays under 1MB, which keeps you within the upload limits used by most job portals and company career sites."
  },
  {
    q: "What is the best resume format to pass an ATS?",
    a: "A reverse-chronological, one-page (or two-page for senior profiles) single-column layout with the sections Summary, Skills, Experience, Projects and Education. Use a standard font, avoid headers and footers, and save as a text-based PDF rather than a scanned image."
  },
  {
    q: "Can I check the ATS score of my resume after building it?",
    a: "Yes. Once your resume is ready, run it through the free JobsDart ATS resume checker to get a compatibility score out of 100 against a specific job description, along with the keywords you are missing."
  }
];

export interface HowToStep {
  name: string;
  text: string;
}

export const RESUME_BUILDER_STEPS: HowToStep[] = [
  {
    name: "Add your details",
    text: "Enter your contact information, education, work experience, projects and skills. An existing resume can be imported so you are not retyping your history."
  },
  {
    name: "Generate AI bullet points",
    text: "Let the AI resume writer rewrite each role into quantified, action-driven bullet points that use the vocabulary recruiters and applicant tracking systems search for."
  },
  {
    name: "Pick an ATS-friendly template",
    text: "Switch between single-column, parse-safe templates and watch the live preview until the layout suits your target role."
  },
  {
    name: "Download an ATS-safe PDF",
    text: "Export a print-quality PDF with a readable text layer, then run it through the free ATS resume checker to confirm your score before you apply."
  }
];

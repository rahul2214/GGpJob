import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-fills-job-forms',
  tint: 'violet',
  title: 'How to Build an AI Agent That Fills Job Application Forms',
  heading: 'An agent that fills application forms',
  description:
    'How to map an arbitrary application form to a candidate profile: field classification, the questions an agent must never answer, and handling what it has not seen.',
  keywords: [
    'ai agent fill job forms',
    'automate job application forms',
    'form filling ai agent',
    'ats form automation',
    'job application form automation',
    'field mapping ai',
    'auto fill applications',
    'form classification llm',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Filling a form is a mapping problem with a sharp edge: some fields must never be answered by a machine, and telling which is the actual work.',
  sections: [
    {
      heading: 'The problem stated precisely',
      paragraphs: [
        'You have a structured candidate profile and an arbitrary HTML form written by someone who never considered you. The task is mapping one to the other — deciding that "Preferred name" wants the first name, that "Notice period" wants a duration, that "Tell us why you are interested" cannot be answered by a machine at all.',
        'Framed this way it is a classification problem, not a generation problem, for every field except the free-text ones. That distinction is what makes it tractable.',
      ],
    },
    {
      heading: 'Classify fields, do not guess values',
      paragraphs: [
        'The reliable design asks the model what each field *is*, not what to put in it. Given the label, name attribute, placeholder, surrounding text and input type, classify it into a known set: given name, family name, email, phone, years of experience, notice period, salary expectation, and so on.',
        'Then your own code supplies the value from the profile. This keeps the model doing what it is good at — reading messy context and categorising — while values come from a source of truth. A model asked directly for "the value for this field" will invent a plausible one.',
      ],
      bullets: [
        'Input to the model: label, name, id, placeholder, type, nearby text',
        'Output: a category from a fixed list, plus a confidence',
        'Values: always from the candidate profile, never generated',
        'Unknown category: escalate rather than guess',
      ],
    },
    {
      heading: 'The fields an agent must never answer',
      paragraphs: [
        'Some questions are statements about the candidate with legal or contractual weight, and no confidence threshold makes automating them acceptable. These need a hard-coded refusal, independent of what the classifier returns.',
        'This list is short and absolute. Everything on it either constitutes a declaration or commits the candidate to something they have not agreed to.',
      ],
      bullets: [
        'Right-to-work and visa status declarations',
        'Criminal record and background disclosures',
        'Salary expectations, unless explicitly pre-authorised as a number',
        'Notice period, where it forms a commitment',
        'Any checkbox certifying that statements are true',
        'Free-text motivation questions about why this company',
      ],
    },
    {
      heading: 'Handling fields you have never seen',
      paragraphs: [
        'Employers invent fields constantly. The agent will meet questions nothing in your taxonomy covers, and the failure mode to avoid is filling them plausibly anyway.',
        'Route the unknown to a human with the surrounding context, and record the answer against a normalised form of the question. The second time a similar field appears, you have an answer — which turns an unbounded problem into one that shrinks with use.',
      ],
    },
    {
      heading: 'Verify after filling, before submitting',
      paragraphs: [
        'Filling a field is not the same as the field accepting the value. Dropdowns reject free text, date pickers reformat, phone inputs strip characters, and required fields appear only after another is completed.',
        'Read the form back after filling and compare against what you intended. A cheap diff catches the entire class of "it typed it and the page ignored it" errors, which otherwise surface as an application submitted with half its fields blank.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should the model generate field values directly?',
      a: 'No. Have it classify what each field is, then supply the value from the candidate profile in your own code. A model asked for a value will produce a plausible one rather than the true one.',
    },
    {
      q: 'Which form fields should an agent never fill?',
      a: 'Right-to-work and background declarations, certification checkboxes, salary and notice commitments, and free-text questions about motivation. These are statements about the candidate, not data entry.',
    },
    {
      q: 'What should happen when the agent meets an unfamiliar field?',
      a: 'Escalate to a human with the surrounding context and record the answer against a normalised version of the question, so the next similar field is already solved. Never fill it plausibly.',
    },
    {
      q: 'Why verify the form after filling it?',
      a: 'Because filling a field and the field accepting the value are different things. Dropdowns reject free text, inputs reformat, and conditional fields appear late — a read-back diff catches all of it before submission.',
    },
  ],
  related: ['how-to-build-an-ai-auto-apply-tool', 'how-to-build-an-ai-agent-that-handles-different-forms', 'how-to-build-a-universal-ats-automation-agent'],
};

export default post;

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
  anchors: ['fills job forms', 'field classification'],
  excerpt:
    'Filling a form is a mapping problem with a sharp edge: some fields must never be answered by a machine, and telling which is the actual work.',
  keyTakeaways: [
    'Classify what a field is; never ask a model what to put in it.',
    'A short absolute refusal list sits outside the classifier and overrides it.',
    'Unknown fields escalate, and the answer is recorded so the problem shrinks with use.',
    'Filling a field and the field accepting the value are different events.',
    'Cache the mapping per form signature so the second application is nearly free.',
  ],
  sections: [
    {
      heading: 'The problem stated precisely',
      paragraphs: [
        'You have a structured candidate profile and an arbitrary HTML form written by someone who never considered you. The task is mapping one to the other — deciding that "Preferred name" wants the first name, that "Notice period" wants a duration, that "Tell us why you are interested" cannot be answered by a machine at all.',
        'Framed this way it is a classification problem, not a generation problem, for every field except the free-text ones. That distinction is what makes it tractable.',
        'It also determines how you test it. Classification has a right answer you can assert against a fixture, so a corpus of saved forms with expected field categories becomes a regression suite — which is not available at all if the model is producing values.',
      ],
    },
    {
      heading: 'Classify fields, do not guess values',
      paragraphs: [
        'The reliable design asks the model what each field *is*, not what to put in it. Given the label, name attribute, placeholder, surrounding text and input type, classify it into a known set: given name, family name, email, phone, years of experience, notice period, salary expectation, and so on.',
        'Then your own code supplies the value from the profile. This keeps the model doing what it is good at — reading messy context and categorising — while values come from a source of truth. A model asked directly for "the value for this field" will invent a plausible one.',
        'Give it the surrounding context rather than the field alone. A label reading "Name" means something different inside a section headed "Emergency contact" than inside one headed "Your details", and a classifier looking only at the input has no way to tell.',
      ],
      bullets: [
        'Input to the model: label, name, id, placeholder, type, nearby text',
        'Output: a category from a fixed list, plus a confidence',
        'Values: always from the candidate profile, never generated',
        'Unknown category: escalate rather than guess',
      ],
      table: {
        caption: 'Field type and how to handle it',
        columns: ['Field type', 'Handling', 'Failure to avoid'],
        rows: [
          ['Known personal detail', 'Classify, fill from profile', 'Generating the value'],
          ['Constrained select', 'Match to an option, else escalate', 'Choosing the nearest option'],
          ['Numeric with units', 'Normalise, then fill', 'Months entered as years'],
          ['Legal declaration', 'Never fill', 'Any confidence threshold'],
          ['Free-text motivation', 'Draft at most, human approves', 'Silent generic filler'],
          ['Unrecognised', 'Escalate, record the answer', 'Plausible invention'],
        ],
      },
    },
    {
      heading: 'The fields an agent must never answer',
      paragraphs: [
        'Some questions are statements about the candidate with legal or contractual weight, and no confidence threshold makes automating them acceptable. These need a hard-coded refusal, independent of what the classifier returns.',
        'This list is short and absolute. Everything on it either constitutes a declaration or commits the candidate to something they have not agreed to.',
        'Implement it as a check the classifier cannot override rather than as another category. A field matching the refusal patterns is removed from what the filling step can touch, which means a future change to the classifier or its prompt cannot quietly reintroduce it.',
      ],
      bullets: [
        'Right-to-work and visa status declarations',
        'Criminal record and background disclosures',
        'Salary expectations, unless explicitly pre-authorised as a number',
        'Notice period, where it forms a commitment',
        'Any checkbox certifying that statements are true',
        'Free-text motivation questions about why this company',
        'Voluntary demographic questions, which are the candidate’s alone',
      ],
    },
    {
      heading: 'Handling fields you have never seen',
      paragraphs: [
        'Employers invent fields constantly. The agent will meet questions nothing in your taxonomy covers, and the failure mode to avoid is filling them plausibly anyway.',
        'Route the unknown to a human with the surrounding context, and record the answer against a normalised form of the question. The second time a similar field appears, you have an answer — which turns an unbounded problem into one that shrinks with use.',
        'Normalise on the question text rather than on a field identifier, since identifiers differ across employers using the same platform while the question wording barely changes. Match new questions against stored ones by meaning, and surface a near match for confirmation rather than answering it silently.',
      ],
    },
    {
      heading: 'Make the second application nearly free',
      paragraphs: [
        'Classifying every field on every application is the largest recurring cost in this system, and most of it is repeated work. The same employer, and often the same platform, presents the same form for every posting.',
        'Cache the mapping against a signature derived from the form’s structure — field names, types and order — rather than the URL, which differs per posting. A cache hit reduces the work to a deterministic fill and a verification pass.',
        'Validate the cached mapping cheaply before trusting it. Confirming that the expected fields are still present costs one DOM read, and it is what turns a stale cache into a fall-through to classification instead of an application with three fields silently unfilled.',
      ],
    },
    {
      heading: 'Verify after filling, before submitting',
      paragraphs: [
        'Filling a field is not the same as the field accepting the value. Dropdowns reject free text, date pickers reformat, phone inputs strip characters, and required fields appear only after another is completed.',
        'Read the form back after filling and compare against what you intended. A cheap diff catches the entire class of "it typed it and the page ignored it" errors, which otherwise surface as an application submitted with half its fields blank.',
        'Modern forms make this more necessary rather than less. A framework-controlled input may accept typed characters visually and never update its own state, so a value that is plainly on screen is absent from what gets submitted — and only reading the state back detects it.',
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
      a: 'Right-to-work and background declarations, certification checkboxes, salary and notice commitments, demographic questions, and free-text motivation questions.',
    },
    {
      q: 'What should happen when the agent meets an unfamiliar field?',
      a: 'Escalate to a human with the surrounding context and record the answer against a normalised version of the question, so the next similar field is already solved. Never fill it plausibly.',
    },
    {
      q: 'Why verify the form after filling it?',
      a: 'Because filling a field and the field accepting the value are different things. Dropdowns reject free text, inputs reformat, and conditional fields appear late — a read-back diff catches all of it.',
    },
    {
      q: 'How is the never-fill list enforced?',
      a: 'As a check the classifier cannot override, removing those fields from what the filling step may touch — so a prompt change cannot quietly reintroduce them.',
    },
    {
      q: 'How do I avoid reclassifying the same form repeatedly?',
      a: 'Cache the mapping against the form structural signature, not the URL, and cheaply confirm the expected fields are still present before trusting a cache hit.',
    },
  ],
  related: ['how-to-build-an-ai-auto-apply-tool', 'how-to-build-an-ai-agent-that-handles-different-forms', 'how-to-build-a-universal-ats-automation-agent'],
};

export default post;

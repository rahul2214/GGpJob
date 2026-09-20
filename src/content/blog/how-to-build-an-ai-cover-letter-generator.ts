import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-cover-letter-generator',
  tint: 'emerald',
  title: 'How to Build an AI Cover Letter Generator',
  heading: 'Building a cover letter generator',
  description:
    'Why generated cover letters read as generated, what inputs actually make one specific, and how to build a generator whose output is worth sending.',
  keywords: [
    'ai cover letter generator',
    'build cover letter ai',
    'automated cover letter',
    'cover letter personalisation',
    'ai writing cover letters',
    'cover letter prompt design',
    'generated cover letter quality',
    'job application writing ai',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['cover letter generator', 'why this one'],
  excerpt:
    'Most generated cover letters fail for one reason: they were produced from the job description alone, which every other applicant also had.',
  keyTakeaways: [
    'Improving the writing of a generic letter produces a better generic letter.',
    'Specificity requires an input the job description does not contain.',
    'One question — why this one — supplies what no prompt engineering can extract.',
    'Constrain length and ban the recognisable openings; short is much harder to pad.',
    'A generator that declines to produce a page is more useful than one that always does.',
  ],
  sections: [
    {
      heading: 'Why they read as generated',
      paragraphs: [
        'A cover letter written from the job description and a CV contains nothing the reader does not already have. It restates the posting back at them and asserts enthusiasm, which is exactly the texture people recognise instantly.',
        'The problem is not writing quality. Models write fluent prose easily. It is that fluent prose about nothing specific is precisely what a generic letter is, so improving the writing makes it a better generic letter.',
        'The tells are structural rather than lexical, which is why rewriting does not help. The same paragraph shapes, the same opening move, the same closing — a reader seeing forty a week recognises the pattern regardless of which words fill it.',
      ],
    },
    {
      heading: 'Specificity requires an input nobody else has',
      paragraphs: [
        'A letter is only specific if it contains something that could not have been written for another company. That information has to come from somewhere, and the job description is not it.',
        'So the design question is what additional input the generator gets. Without one, you are building a rephraser; with one, you are building something worth sending.',
        'A blunt test settles whether you have it: remove the company name and the requirement list and see whether the letter still works for any employer in the sector. If it does, no specific input reached the generator, whatever the prompt asked for.',
      ],
      bullets: [
        'A concrete reason from the candidate, in their own words',
        'Something real about the company — a product decision, a public post',
        'A specific piece of the candidate’s work that maps to a stated problem',
        'A connection: someone they know, an event, prior use of the product',
      ],
      table: {
        caption: 'Where each element has to come from',
        columns: ['Element', 'Source', 'Automatable'],
        rows: [
          ['Relevant achievements', 'Structured profile', 'Yes'],
          ['Mapping to requirements', 'The posting', 'Yes'],
          ['Correct register', 'General knowledge', 'Yes'],
          ['Why this company', 'The candidate, only', 'No'],
          ['A view on their product', 'The candidate, after using it', 'No'],
          ['A connection there', 'The candidate, only', 'No'],
        ],
      },
    },
    {
      heading: 'Ask the candidate one question',
      paragraphs: [
        'The highest-value thing a generator can do is ask: why this one? Even a scrappy two-sentence answer supplies the specificity that no amount of prompt engineering extracts from a job description.',
        'Keep it to one question and make it skippable — but when it is skipped, produce a shorter, plainer letter rather than padding the gap with enthusiasm. A brief honest letter reads better than a long one asserting a passion the candidate never expressed.',
        'Use their words rather than improving them. A slightly awkward sentence in a candidate’s own voice is worth more than a polished one the model composed, because the awkwardness is itself evidence that a person wrote it.',
      ],
    },
    {
      heading: 'Constrain the form hard',
      paragraphs: [
        'Left alone, models produce four florid paragraphs opening with "I am writing to express my keen interest". Constrain length, ban the openings everyone recognises, and require every claim to trace to the candidate’s material.',
        'Short is better. Three tight paragraphs — why this role, the most relevant evidence, what you would bring — outperforms a page, and is also much harder to fill with nothing.',
        'Enforce the constraints in code rather than in the prompt. Generate, count, check the opening against a banned list, verify each claim against the profile, and regenerate on failure — because an instruction competes with everything else the model is trying to do, and a check does not.',
      ],
    },
    {
      heading: 'Verify before it is sent',
      paragraphs: [
        'Cover letters invent more freely than CVs, because they are prose rather than a list of facts and there is no structure pulling them back. A sentence about a project the candidate did not run is easy to produce and easy to miss in a fluent paragraph.',
        'Run a verification pass over the output against the structured profile, and remove anything unsupported rather than softening it. "Familiar with Kubernetes" is not a safer version of an unsupported Kubernetes claim; it is the same claim with hedging, and it will still be asked about.',
        'Watch for inflation as well as invention, since it introduces no new fact and changes what is being claimed. "Contributed to" becoming "led" is the version of this that a naive claim check will pass and an interviewer will not.',
        'Show the candidate the letter with anything unverifiable marked. That is a ninety-second review that catches the one sentence that matters, where presenting a clean page invites approval without reading.',
      ],
      bullets: [
        'Every factual claim traced to the structured profile',
        'Unsupported claims removed, never hedged',
        'Strength checked as well as content — "led" versus "contributed to"',
        'Unverifiable lines flagged for the candidate, not hidden',
      ],
    },
    {
      heading: 'Know when to produce nothing',
      paragraphs: [
        'If the candidate has no specific reason, the company has no distinctive public information, and the match is ordinary, the honest output is a short factual note rather than a manufactured narrative.',
        'A generator willing to say "there is not enough here for a strong letter; send the CV and a two-line note" is more useful than one that always produces a page. It also saves the candidate from sending something that actively signals automation.',
        'Where a letter is genuinely optional, saying so is a legitimate output. A strong CV with no letter reads as efficient; a strong CV with a hollow letter reads as someone who assumed the reader would not notice.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why do AI cover letters sound generic?',
      a: 'Because they are written from the job description and CV, which the reader already has. Fluent prose about nothing specific is what a generic letter is, so better writing just produces a better generic letter.',
    },
    {
      q: 'What input makes a cover letter specific?',
      a: 'Something that could not have been written for another company: the candidate’s own reason for wanting this role, a real detail about the company, or a specific piece of their work matching a stated problem.',
    },
    {
      q: 'Should the generator ask the candidate anything?',
      a: 'One question — why this role. A scrappy two-sentence answer supplies specificity that no prompt engineering can extract from the posting alone.',
    },
    {
      q: 'Should it always produce a full letter?',
      a: 'No. With no specific reason and an ordinary match, a short factual note is the honest output. A manufactured page actively signals automation.',
    },
    {
      q: 'How do I stop a cover letter inventing things?',
      a: 'A separate verification pass against the structured profile that removes unsupported claims rather than hedging them, and checks strength as well as content.',
    },
    {
      q: 'Should the candidate’s own wording be polished?',
      a: 'Usually not. A slightly awkward sentence in their voice is worth more than a smooth one the model wrote, because the awkwardness is evidence a person was involved.',
    },
  ],
  related: ['how-to-build-an-ai-job-application-personalization-engine', 'how-to-reduce-hallucinations-in-ai-resume-generation', 'ai-resume-writing-guide'],
};

export default post;

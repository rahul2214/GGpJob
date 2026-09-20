import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-agent-privacy-resume-data',
  tint: 'rose',
  title: 'AI Agent Privacy: What Happens to Your Resume and Job Data?',
  heading: 'What happens to your resume data',
  description:
    'Where your CV actually goes when an AI job tool processes it, which questions to ask a vendor, and what the answers should be.',
  keywords: [
    'ai resume privacy',
    'job data privacy ai',
    'is my resume used for training',
    'ai job tool data retention',
    'resume data sharing',
    'job search privacy',
    'ai vendor data questions',
    'candidate data protection',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Security',
  anchors: ['resume privacy', 'data retention'],
  excerpt:
    'A CV is a dossier: employment history, education, location, contact details, often more. Uploading one to a tool is a bigger decision than it feels like.',
  keyTakeaways: [
    'A CV is one of the most complete personal records most people produce, and it is handed over casually.',
    'It ends up in several places at once, and logs and error monitoring are the longest-lived copies.',
    '"Do you train on my data" is too narrow — ask about every layer, including named sub-processors.',
    'Deletion claims vary enormously; ask what it removes and by when, including backups.',
    'Strip address, date of birth and identity numbers. None affect suitability; all make a leak valuable.',
  ],
  sections: [
    {
      heading: 'What a CV actually contains',
      paragraphs: [
        'Treated casually because it is a document you send to strangers, a CV is nonetheless one of the most complete personal records most people produce: full name, contact details, location, employment history with dates, education, and enough detail to answer most security questions.',
        'Handing that to a tool is a meaningful transfer. It deserves the questions you would ask before connecting a bank account, and it rarely gets them because the format is so familiar.',
        'There is a second sensitivity people miss. The fact that you are looking at all is confidential if you are currently employed, and a tool that stores, shares or accidentally exposes that fact is disclosing something more immediately damaging than your address.',
      ],
    },
    {
      heading: 'Where it goes',
      paragraphs: [
        'A typical AI job tool sends your CV through several hands: its own storage, a model provider for processing, possibly an embedding service, possibly a monitoring platform that captured it in a log or an error report.',
        'Each is a copy with its own retention period, and the ones nobody thinks about — logs and error tracking — are frequently the longest-lived and least protected, because they were never designed as personal data stores.',
        'Embedding stores deserve a specific mention. A vector derived from your CV is still personal data, and deleting the original document while leaving the embedding behind is a deletion that did not happen in any meaningful sense.',
      ],
      bullets: [
        'The vendor’s own database and backups',
        'The model provider processing the text',
        'An embedding or vector store, if matching is used',
        'Application logs and error-monitoring services',
        'Any employer or board the tool submitted to on your behalf',
      ],
      table: {
        caption: 'Where copies live and how recoverable each is',
        columns: ['Copy', 'Typical lifetime', 'Can it be deleted on request?'],
        rows: [
          ['Vendor database', 'Until you delete', 'Usually yes'],
          ['Vendor backups', 'Weeks to months after deletion', 'Eventually, on a cycle'],
          ['Model provider', 'Varies by contract tier', 'Sometimes, ask specifically'],
          ['Embedding store', 'Often overlooked entirely', 'Only if they thought about it'],
          ['Logs and error monitoring', 'Often the longest', 'Rarely designed for it'],
          ['Employers already applied to', 'Their retention policy', 'No — outside the vendor entirely'],
        ],
      },
    },
    {
      heading: 'The training question, asked correctly',
      paragraphs: [
        '"Do you train on my data" is the question everyone asks and it is too narrow. The vendor may not train, while the model provider they use might under the terms of the tier they chose — which is a distinction most privacy pages elide.',
        'Ask instead whether data is excluded from training at every layer including sub-processors, and whether they can name those sub-processors. A vendor who cannot answer that has not thought about it, which is itself the answer.',
        'Note also that most providers offer a tier where inputs are excluded from training, and that it usually costs more. A free tool processing your CV is paying for that processing somehow, and it is reasonable to ask how.',
      ],
    },
    {
      heading: 'Questions worth asking a vendor',
      paragraphs: [
        'These are ordinary questions that a serious product can answer quickly. Vagueness on any of them is the signal, more than any particular answer.',
        'Pay attention to deletion in particular. "You can delete your account" and "deletion removes your data from backups and sub-processors within a stated period" are very different commitments.',
        'Ask in writing, by email or support ticket. A clear written answer is worth having on record, and the willingness to put it in writing is itself informative.',
      ],
      bullets: [
        'Which sub-processors see my CV, by name?',
        'Is it excluded from model training at every layer?',
        'How long is it retained, including in logs and backups?',
        'What exactly does deletion remove, and by when?',
        'Is it used to match me to employers without my initiating that?',
        'Where is it stored, and under which jurisdiction?',
      ],
    },
    {
      heading: 'The rights you may already have',
      paragraphs: [
        'Depending on where you live, this is not only a matter of vendor goodwill. Several jurisdictions give you a right to know what personal data an organisation holds, to obtain a copy, to have inaccuracies corrected and to request erasure.',
        'Those rights typically apply to any organisation processing your data, not only to ones based where you are, which matters when the tool is a start-up on another continent. There are usually statutory deadlines for a response.',
        'The rules differ enough by country that it is worth checking your own regulator rather than relying on a summary. The practical point is that if a vendor refuses to answer the questions above, you may have a route that does not depend on their cooperation.',
      ],
    },
    {
      heading: 'Reducing your exposure',
      paragraphs: [
        'Keep the harvestable fields out of the document you upload. Full address, date of birth and any identity or tax number are not needed to assess suitability, and they are precisely what makes a leaked CV valuable.',
        'Prefer tools that process without storing, and be deliberate about breadth: a tool that submits applications on your behalf necessarily shares your details with every employer it contacts, and those copies are beyond the vendor’s deletion policy entirely.',
        'Consider a dedicated email address for job searching. It costs nothing, it keeps application traffic out of your main inbox, and if the address begins receiving unrelated marketing you have learned something specific about where your data went.',
      ],
      example: {
        title: 'Two versions of the same CV',
        paragraphs: [
          'Version A, as most people upload it: full name, home address, date of birth, personal mobile, personal email, full employment history with dates, university and graduation year, and a line mentioning a current employer project under NDA.',
          'Version B, trimmed for upload: full name, city and country, a job-search email address, employment history with months and years, university without the graduation year, and the NDA project described generically as its technical shape rather than by client name.',
          'Version B assesses identically for suitability. It also removes the date of birth, the home address and the client name — which are the three things that make a leak actually harmful, and none of which any recruiter needed at this stage.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'Is my resume used to train AI models?',
      a: 'Sometimes, and the question needs asking at every layer. A vendor may not train on it while the model provider they use does, depending on the tier chosen — so ask about sub-processors by name.',
    },
    {
      q: 'Where does my CV actually end up?',
      a: 'The vendor’s database and backups, the model provider, possibly an embedding store, and often application logs or error-monitoring services — which are usually the longest-lived and least considered copies.',
    },
    {
      q: 'What should I remove from a CV before uploading it?',
      a: 'Full address, date of birth and any identity or tax number. None affect an assessment of your suitability, and all are what make a leaked CV worth stealing.',
    },
    {
      q: 'Does deleting my account remove my data?',
      a: 'Not necessarily. Ask specifically what deletion removes and by when, including backups and sub-processors. "You can delete your account" is a much weaker commitment than it sounds.',
    },
    {
      q: 'Do I have a legal right to ask these questions?',
      a: 'In many jurisdictions yes — rights to access, correction and erasure typically apply to any organisation processing your data, with statutory response deadlines. Check your own regulator, since the rules differ.',
    },
    {
      q: 'What about the embedding of my CV?',
      a: 'A vector derived from your CV is still personal data. Deleting the document while leaving the embedding is not a deletion in any meaningful sense, so ask about it explicitly.',
    },
  ],
  related: ['how-to-protect-user-credentials-in-ai-job-automation', 'how-to-build-a-secure-ai-job-application-platform', 'fake-recruiter-scams'],
};

export default post;

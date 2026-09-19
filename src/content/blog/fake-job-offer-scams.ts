import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'fake-job-offer-scams',
  tint: 'rose',
  title: 'Fake Job Offer Scams: How to Spot and Avoid Them',
  heading: 'Spotting a fake job offer',
  description:
    'How fake job offer scams work, the signals that reliably identify them, how to verify an offer independently, and what to do if you have already engaged.',
  keywords: [
    'fake job offer',
    'job offer scam',
    'fake job offer letter',
    'job scam warning signs',
    'employment scam',
    'fake offer letter verification',
    'job fraud india',
    'avoid job scams',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Job Search Safety',
  excerpt:
    'Every fake offer needs one of two things from you: money, or identity documents. Knowing which makes the pattern easy to recognise early.',
  sections: [
    {
      heading: 'The two things every scam wants',
      paragraphs: [
        'However elaborate the pretext, a fraudulent job offer is trying to obtain money or documents. Money arrives disguised as a fee — registration, training, equipment, visa processing, background check. Documents are gathered for identity theft, often as an ordinary-looking onboarding pack.',
        'This single observation is the most useful filter available. When a process begins moving towards either, treat everything preceding it as unverified regardless of how professional it appeared. Scams invest heavily in looking legitimate precisely because the request that follows will not.',
      ],
    },
    {
      heading: 'The signals that reliably identify a fake',
      paragraphs: [
        'Individually these can have innocent explanations. Together they are conclusive, and in practice most fraudulent offers show several at once.',
        'The strongest single indicator is an offer arriving with little or no assessment. Organisations do not make real employment commitments to people they have not evaluated, because hiring the wrong person is expensive. An offer without genuine interviews is not a lucky break.',
      ],
      bullets: [
        'Any request for payment, for any reason, at any stage',
        'An offer made without meaningful interviews or assessment',
        'Communication only through personal email or messaging apps',
        'Pay significantly above market with vague responsibilities',
        'Urgency — sign today, the position closes tonight',
        'Requests for identity documents or bank details before an offer is verified',
        'An offer letter with inconsistent formatting, wrong legal entity or odd language',
      ],
    },
    {
      heading: 'Verifying independently',
      paragraphs: [
        'The essential principle is that verification must not use any channel the sender provided. A fraudulent operation controls its own phone numbers, domains and reference contacts, so checking those confirms nothing.',
        'Find the company yourself. Locate its official site through a search engine rather than a link in the email, call the switchboard number listed publicly, and ask to be connected to the person who contacted you. A real employer handles this routinely; a fraudulent one cannot survive it.',
      ],
      bullets: [
        'Search for the company independently — never use links you were sent',
        'Compare the email domain against the official one, character by character',
        'Call the publicly listed number and ask for the person by name',
        'Check the company register for the legal entity named in the letter',
        'Look up the recruiter on professional networks and check account age',
      ],
    },
    {
      heading: 'Why professionals fall for these',
      paragraphs: [
        'It is tempting to assume only the careless are caught. In reality these succeed against experienced people, because they exploit circumstance rather than intelligence. Someone recently made redundant, or on a visa with limited time to find a sponsor, is under pressure that distorts judgement.',
        'Scams are built for that pressure. Urgency is manufactured deliberately so there is no time to verify. Recognising urgency itself as the warning sign, independent of the content, is the most transferable defence.',
      ],
    },
    {
      heading: 'The overpayment variant',
      paragraphs: [
        'A common pattern deserves specific mention. After an apparent hire, you are sent a cheque or transfer to buy equipment from a specified supplier. The payment is fraudulent and will be reversed, but the money you forward to the supplier — controlled by the same people — is gone, and it is yours.',
        'The rule is simple: a legitimate employer never sends you money to pass to a third party. Any variation on this, however reasonably explained, is fraud.',
      ],
    },
    {
      heading: 'If you have already engaged',
      paragraphs: [
        'Act quickly, and do not let embarrassment delay you. If you sent money, contact your bank immediately — rapid reporting is what makes recovery possible at all. If you shared identity documents, treat it as an identity theft risk: alert your bank, monitor your credit record and consider a fraud flag.',
        'Report it. Fraud reporting feels futile individually and is what allows patterns to be identified and networks disrupted. Report to your national cybercrime or fraud authority, to the platform where you were contacted, and to the real company being impersonated, which usually wants to know.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should I ever pay a fee for a job?',
      a: 'No. Legitimate employers do not charge candidates for registration, training, equipment, background checks or visa processing. Any request for payment at any stage is sufficient reason to stop.',
    },
    {
      q: 'How do I verify an offer letter is genuine?',
      a: 'Verify through channels you found yourself, never ones you were sent. Search for the company independently, call the publicly listed switchboard, and check the legal entity on the company register.',
    },
    {
      q: 'Is it safe to share my identity documents during onboarding?',
      a: 'Only after independently verifying the employer, and normally after a formal offer following real interviews. Requests for documents early in a process, or before verification, are a common identity-theft pattern.',
    },
    {
      q: 'What should I do if I already sent money to a fake employer?',
      a: 'Contact your bank immediately — speed determines whether recovery is possible — then report to your national fraud or cybercrime authority, the platform where you were contacted, and the company being impersonated.',
    },
  ],
  related: ['fake-recruiter-scams', 'visa-sponsorship-tech-jobs', 'remote-tech-jobs'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'will-recruiters-use-ai-to-interview-ai-agents',
  tint: 'slate',
  title: 'Will Recruiters Use AI to Interview AI Agents?',
  heading: 'Machines talking to machines',
  description:
    'Whether automated screening will end up interviewing automated candidates, what that would and would not achieve, and where hiring is likely to go instead.',
  keywords: [
    'ai interviewing ai',
    'automated screening interviews',
    'ai to ai hiring',
    'recruitment automation future',
    'screening arms race',
    'work sample assessment',
    'hiring signal quality',
    'future of recruiting',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI & Careers',
  excerpt:
    'Parts of this already happen, and the reason it will not go much further is that neither side gets what they need from it.',
  sections: [
    {
      heading: 'It already happens at the screening layer',
      paragraphs: [
        'Automated screening reads applications that were partly automated. Asynchronous video and questionnaire tools already assess candidates who prepared their answers with a model. In that sense the loop is closed at the top of the funnel.',
        'What is being described as "AI interviewing AI" is mostly this: two automated layers exchanging documents, with no human judgement on either side until later.',
      ],
    },
    {
      heading: 'Why it does not extend further',
      paragraphs: [
        'Hiring exists to answer whether a specific person can do specific work and function in a specific team. An exchange between two systems answers neither, however sophisticated the exchange.',
        'If candidates delegate answering and employers delegate assessing, the process generates a lot of activity and no information. Both sides notice — employers because their hires do not improve, candidates because they are rejected without ever reaching a person.',
      ],
    },
    {
      heading: 'The likely correction',
      paragraphs: [
        'When a signal becomes automatable, its value falls and hiring moves toward signals that cannot be. That has happened before with keyword-optimised CVs and with formulaic cover letters.',
        'The plausible direction is fewer, higher-quality human interactions supported by better preparation, alongside more work-sample assessment where the output is the evidence.',
      ],
      bullets: [
        'Work samples and paid trial tasks, where output is checkable',
        'Fewer but longer conversations with actual team members',
        'More weight on referrals and demonstrable track record',
        'Less reliance on documents as a screening signal',
      ],
    },
    {
      heading: 'Where automation genuinely helps hiring',
      paragraphs: [
        'It is good at what recruiters do badly at volume: reading every application rather than the first fifty, applying criteria consistently, responding to everyone, scheduling without a fortnight of email.',
        'Those are real improvements for candidates as well as employers, and they do not require automating the judgement. The distinction between administering a process and deciding it is the one worth holding.',
      ],
    },
    {
      heading: 'The reasonable expectation',
      paragraphs: [
        'Automation will keep expanding in screening and administration, and the decision will stay human — not out of sentiment, but because an employer accountable for a hire will want to have met the person.',
        'Where that breaks down, it produces bad hiring rather than efficient hiring, and organisations correct it once they notice. The equilibrium is automated logistics, human judgement.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Are AI systems already screening AI-assisted applications?',
      a: 'Yes, at the top of the funnel. Automated screening reads partly automated applications, and asynchronous tools assess candidates who prepared answers with a model.',
    },
    {
      q: 'Will interviews become fully machine-to-machine?',
      a: 'Unlikely. Hiring answers whether a specific person can do specific work in a specific team, and an exchange between two systems answers neither side question.',
    },
    {
      q: 'What replaces automatable signals?',
      a: 'Work samples where the output is checkable, fewer but longer conversations with team members, and more weight on referrals and demonstrable track record.',
    },
    {
      q: 'Where does automation genuinely improve hiring?',
      a: 'Reading every application rather than the first fifty, applying criteria consistently, responding to everyone and scheduling quickly — administering the process, not deciding it.',
    },
  ],
  related: ['what-is-ai-to-ai-hiring', 'the-future-of-job-applications-humans-vs-ai-agents', 'how-companies-use-ai-in-hiring'],
};

export default post;

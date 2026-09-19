import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'rag-for-job-search-ai-career-assistant',
  tint: 'violet',
  title: 'RAG for Job Search: How to Build an AI Career Assistant',
  heading: 'Building a career assistant on RAG',
  description:
    'Designing an AI career assistant that answers from your own data: what it should retrieve, how to scope access per user, and where it must refuse to guess.',
  keywords: [
    'ai career assistant',
    'rag career assistant',
    'job search chatbot',
    'career advice ai',
    'per user data scoping',
    'assistant authorization',
    'grounded career advice',
    'career assistant design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'A career assistant is a retrieval problem wearing a chat interface. Most of the work is deciding what it is allowed to see.',
  sections: [
    {
      heading: 'The assistant is only as good as its retrieval',
      paragraphs: [
        'The chat interface is the least interesting part. What determines whether the assistant is useful is whether it can reach the right things: the live postings, this user’s profile and applications, and the platform’s own guidance.',
        'Build the retrieval layer as a set of explicit sources rather than one blended index. A question about application status and a question about which roles to target need different data, and merging them into one vector store makes both worse.',
      ],
    },
    {
      heading: 'Scope every retrieval to the asking user',
      paragraphs: [
        'This is the part that has to be right before anything else. The assistant reads application histories, saved jobs and profile data — records belonging to one person. Scoping must happen in the query, against the verified session identity, not by instructing the model to only discuss the current user.',
        'Concretely: resolve the user from the session on the server, pass the identifier into the data layer, and let the database enforce ownership. Anything the client sends about who it is, is a claim and not an identity.',
      ],
      bullets: [
        'Resolve identity server-side from the session, never from the request body',
        'Filter at the query, so out-of-scope rows are never retrieved at all',
        'Give the model no tool that can widen its own scope',
        'Log what was retrieved, so an access question can be answered later',
      ],
    },
    {
      heading: 'Different roles need different assistants',
      paragraphs: [
        'A job seeker asking "how am I doing" wants their applications and match quality. A recruiter asking the same wants their postings and pipeline. The same question means different things and requires different data.',
        'Resolve the role from the account, not from the conversation, and select the toolset from it. A shared prompt that tries to serve every role ends up vague for all of them, and role confusion is a security problem as much as a quality one.',
      ],
    },
    {
      heading: 'Know what it must refuse to answer',
      paragraphs: [
        'The temptation is to let the assistant answer everything, and the questions it answers worst are the ones users most want answered: will I get this job, what salary should I ask for, why was I rejected. It has no basis for any of them and will produce a confident guess.',
        'Make those refusals deliberate and useful. "I cannot know why you were rejected — here is what the posting asked for that your profile does not show" is honest and more actionable than a fabricated reason.',
      ],
    },
    {
      heading: 'Ground the advice in the user’s actual data',
      paragraphs: [
        'Generic career advice is free everywhere on the internet, and an assistant that produces it adds nothing. The value is specificity: this posting, your profile, this gap.',
        'That means retrieving the user’s real profile and the real posting before answering, and constraining the response to what those contain. If the assistant is giving advice that would read identically for any user, the retrieval failed.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do I stop a career assistant leaking other users data?',
      a: 'Scope every retrieval in the query against the server-resolved session identity, so out-of-scope rows are never retrieved. Instructing the model to only discuss the current user is not a boundary.',
    },
    {
      q: 'Should one assistant serve job seekers and recruiters?',
      a: 'One entry point, different toolsets. Resolve the role from the account rather than the conversation, since the same question means different things and role confusion is a security issue too.',
    },
    {
      q: 'What should a career assistant refuse to answer?',
      a: 'Whether someone will get a job, what salary they will be offered, and why they were rejected. It has no basis for these, and a confident guess is worse than an honest redirect to what the posting asked for.',
    },
    {
      q: 'How do I know the assistant is actually useful?',
      a: 'If an answer would read identically for any user, the retrieval failed. Value comes from grounding in this profile and this posting, not from generic advice available everywhere.',
    },
  ],
  related: ['how-to-build-a-job-search-rag-system', 'how-to-build-an-ai-career-assistant-for-job-seekers', 'rag-explained'],
};

export default post;

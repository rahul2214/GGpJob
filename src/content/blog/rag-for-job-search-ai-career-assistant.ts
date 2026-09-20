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
  anchors: ['career assistant on RAG', 'scope every retrieval'],
  excerpt:
    'A career assistant is a retrieval problem wearing a chat interface. Most of the work is deciding what it is allowed to see.',
  keyTakeaways: [
    'Explicit sources beat one blended index, because different questions need different data.',
    'Scoping happens in the query against a server-resolved identity, never by instruction.',
    'Resolve the role from the account; role confusion is a security problem, not a quality one.',
    'The questions users most want answered are the ones it has no basis for.',
    'If an answer would read identically for another user, the retrieval failed.',
  ],
  sections: [
    {
      heading: 'The assistant is only as good as its retrieval',
      paragraphs: [
        'The chat interface is the least interesting part. What determines whether the assistant is useful is whether it can reach the right things: the live postings, this user’s profile and applications, and the platform’s own guidance.',
        'Build the retrieval layer as a set of explicit sources rather than one blended index. A question about application status and a question about which roles to target need different data, and merging them into one vector store makes both worse.',
        'Some of those sources are not retrieval at all. Application status is a database query with a definite answer, and routing it through similarity search turns a fact into an approximation — so classify the question first and let structured queries answer structured questions.',
      ],
    },
    {
      heading: 'Scope every retrieval to the asking user',
      paragraphs: [
        'This is the part that has to be right before anything else. The assistant reads application histories, saved jobs and profile data — records belonging to one person. Scoping must happen in the query, against the verified session identity, not by instructing the model to only discuss the current user.',
        'Concretely: resolve the user from the session on the server, pass the identifier into the data layer, and let the database enforce ownership. Anything the client sends about who it is, is a claim and not an identity.',
        'Test it as a property rather than as a case. An automated test that authenticates as one user and attempts to reach another’s records through every retrieval path is worth more than any amount of review, and it keeps working as the codebase grows.',
      ],
      bullets: [
        'Resolve identity server-side from the session, never from the request body',
        'Filter at the query, so out-of-scope rows are never retrieved at all',
        'Give the model no tool that can widen its own scope',
        'Log what was retrieved, so an access question can be answered later',
      ],
      table: {
        caption: 'Which source answers which question',
        columns: ['Question', 'Source', 'Method'],
        rows: [
          ['What is happening with my applications?', 'Application records', 'A database query'],
          ['Why was this role suggested?', 'Stored match reasons', 'A lookup'],
          ['What did I send them in March?', 'Stored documents', 'A lookup'],
          ['What roles should I target?', 'Profile plus postings', 'Retrieval'],
          ['How does this posting compare to me?', 'Posting plus profile', 'Retrieval'],
          ['Will I get this job?', 'Nothing', 'Refuse'],
        ],
      },
    },
    {
      heading: 'Different roles need different assistants',
      paragraphs: [
        'A job seeker asking "how am I doing" wants their applications and match quality. A recruiter asking the same wants their postings and pipeline. The same question means different things and requires different data.',
        'Resolve the role from the account, not from the conversation, and select the toolset from it. A shared prompt that tries to serve every role ends up vague for all of them, and role confusion is a security problem as much as a quality one.',
        'Watch the aggregates for leakage across the boundary. An employer assistant that can see how many other employers viewed a candidate, or a candidate assistant inferring a pipeline from response timings, has learned something across the divide without any row crossing it.',
      ],
    },
    {
      heading: 'Retrieved postings are untrusted text',
      paragraphs: [
        'Job descriptions are written by people outside your organisation and flow straight into the model’s context. A posting containing text addressed to an assistant is a realistic thing to encounter rather than a theoretical concern.',
        'Delimit the untrusted portion clearly, label which fields are platform data and which are third-party content, and state that instructions inside retrieved material are content to be reported rather than followed.',
        'None of that is a boundary, which is why the real control is capability. An assistant that can only read and summarise has nothing for an injected instruction to reach for; one that can send an email or submit an application has everything, and a prompt rule is the only thing in between.',
        'Report an attempt rather than silently ignoring it. A posting containing instructions aimed at an agent tells the candidate something about that employer, and it tells you your defences are being tested in production.',
      ],
    },
    {
      heading: 'Know what it must refuse to answer',
      paragraphs: [
        'The temptation is to let the assistant answer everything, and the questions it answers worst are the ones users most want answered: will I get this job, what salary should I ask for, why was I rejected. It has no basis for any of them and will produce a confident guess.',
        'Make those refusals deliberate and useful. "I cannot know why you were rejected — here is what the posting asked for that your profile does not show" is honest and more actionable than a fabricated reason.',
        'Handle empty retrieval the same way. Returning nothing should produce a clear statement that nothing matched rather than an answer assembled from general knowledge, because that is the single most common way a grounded system quietly stops being grounded.',
      ],
    },
    {
      heading: 'Ground the advice in the user’s actual data',
      paragraphs: [
        'Generic career advice is free everywhere on the internet, and an assistant that produces it adds nothing. The value is specificity: this posting, your profile, this gap.',
        'That means retrieving the user’s real profile and the real posting before answering, and constraining the response to what those contain. If the assistant is giving advice that would read identically for any user, the retrieval failed.',
        'Cite what it used and let the user check. A claim that points at the posting and the profile entry behind it is verifiable and correctable, where an unsourced assertion is something a user can only accept or ignore — and after one wrong answer they will ignore all of them.',
        'Watch the tone as carefully as the content. People arrive at this after rejections and under deadlines, and a technically accurate summary of everything going badly closes the product without improving anyone’s search.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do I stop a career assistant leaking other users data?',
      a: 'Scope every retrieval in the query against the server-resolved session identity, and test it with an account that tries to reach another user records through every path.',
    },
    {
      q: 'Should one assistant serve job seekers and recruiters?',
      a: 'One entry point, different toolsets. Resolve the role from the account rather than the conversation, and check aggregates for inference across the boundary.',
    },
    {
      q: 'What should a career assistant refuse to answer?',
      a: 'Whether someone will get a job, what salary they will be offered, and why they were rejected — and it should say so plainly when retrieval returns nothing.',
    },
    {
      q: 'How do I know the assistant is actually useful?',
      a: 'If an answer would read identically for any user, the retrieval failed. Value comes from grounding in this profile and this posting, not from generic advice.',
    },
    {
      q: 'Should every question go through retrieval?',
      a: 'No. Application status is a database query with a definite answer, and routing it through similarity search turns a fact into an approximation.',
    },
    {
      q: 'Can a job posting attack the assistant?',
      a: 'It can try. Delimit retrieved text, and rely on the assistant having no tool worth reaching for — a prompt rule is not a boundary.',
    },
  ],
  related: ['how-to-build-a-job-search-rag-system', 'how-to-build-an-ai-career-assistant-for-job-seekers', 'rag-explained'],
  references: [
    {
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      publisher: 'arXiv',
      note: 'The paper that named the pattern.',
    },
  ],
};

export default post;

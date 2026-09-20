import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-career-assistant-for-job-seekers',
  tint: 'violet',
  title: 'How to Build an AI Career Assistant for Job Seekers',
  heading: 'An assistant people come back to',
  description:
    'What a career assistant should do, the questions it must handle honestly, grounding advice in real data, tone during a hard search, and measuring usefulness.',
  keywords: [
    'ai career assistant',
    'job seeker assistant',
    'career advice ai',
    'grounded advice',
    'assistant tone design',
    'assistant scope',
    'career chatbot',
    'job search support',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['career assistant', 'grounded advice'],
  excerpt:
    'Job searching is stressful, often for months. That fact should shape the product more than any model capability does.',
  keyTakeaways: [
    'If an answer would read identically for another user, retrieval failed.',
    'A clear scope with an honest refusal outperforms an assistant that answers everything.',
    'The questions people most want answered are ones nobody can know — redirect to what is knowable.',
    'Scope every retrieval in the query against a verified session, never by instruction.',
    'Engagement is the wrong metric; a long session often means someone is stuck.',
  ],
  sections: [
    {
      heading: 'Be specific or be silent',
      paragraphs: [
        'Generic career advice is freely available and adds nothing. An assistant earns its place by knowing this person’s profile, these applications and these postings, and saying something that could only be said to them.',
        'A useful internal test: would this answer read identically for another user? If so, the retrieval failed and the response should not have been produced.',
        'Enforce it as a behaviour rather than an aspiration. When retrieval returns nothing relevant, the assistant should say so and offer what it can do, because an answer assembled from general knowledge is exactly how a grounded product quietly stops being grounded.',
      ],
    },
    {
      heading: 'Scope it to what it can actually do',
      paragraphs: [
        'An assistant that attempts everything does most of it badly. Pick a set of jobs it does well — explaining a match, improving an application, tracking status, preparing for an interview against a specific posting — and be clear about the boundary.',
        'Being able to say "I cannot help with that, but here is what I can do" is a feature. An assistant that confidently answers outside its competence teaches users not to trust the parts it is good at.',
        'State the boundary before it is hit rather than only when refusing. A user who knows from the first screen what this assistant is for asks better questions, and the refusal that follows feels like a defined product rather than a limitation discovered by accident.',
      ],
      bullets: [
        'Explain a specific match or rejection in terms of stated requirements',
        'Improve a specific application against a specific posting',
        'Report status across applications, accurately',
        'Prepare for a named interview using the real posting',
      ],
      table: {
        caption: 'What to answer, and how',
        columns: ['Question', 'Answerable?', 'Response'],
        rows: [
          ['Why was this role suggested?', 'Yes', 'The matched requirements, cited'],
          ['What is missing from my CV for this?', 'Yes', 'Per-requirement evidence gaps'],
          ['What did I send them in March?', 'Yes', 'The stored document'],
          ['Will I get this job?', 'No', 'Say so; give what the posting asks'],
          ['Why did they reject me?', 'No', 'Say so; name the evidenced gaps'],
          ['What salary will I be offered?', 'No', 'Market context, not a prediction'],
        ],
      },
    },
    {
      heading: 'Handle the hard questions honestly',
      paragraphs: [
        'The questions users most want answered — will I get this, what salary should I ask for, why was I rejected — are ones the assistant cannot know. A confident guess is worse than a refusal because it is acted upon.',
        'Redirect to what is knowable. "I cannot know why they rejected you; here is what the posting asked for that your profile does not evidence" is honest and more useful than a fabricated reason.',
        'A refusal has to arrive with something in its place, or it reads as evasion. The pattern that works is one sentence on why the question cannot be answered, followed immediately by the nearest thing that can — which is a more useful exchange than either a guess or a flat no.',
      ],
    },
    {
      heading: 'Tone matters more here than elsewhere',
      paragraphs: [
        'Users arrive after rejections, during redundancy, under visa deadlines. Relentless enthusiasm reads as hollow, and blunt delivery of bad news lands harder than intended.',
        'Aim for matter-of-fact and specific. State the situation, state what can be done, do not editorialise about how they should feel. Most people in a difficult search want clarity rather than encouragement.',
        'Know where the scope ends, too. A user in real distress needs something other than career advice, and an assistant that recognises this, says so plainly and points to appropriate help is behaving better than one that continues optimising their CV.',
      ],
    },
    {
      heading: 'Scope every retrieval to the user',
      paragraphs: [
        'The assistant reads applications, profiles and saved jobs — records belonging to one person. Scoping must happen in the query against the server-verified session, not by telling the model to stay on topic.',
        'This is the failure that ends a product rather than degrading it. Build it as a data-layer guarantee, and test it explicitly with an account that tries to ask about someone else’s data.',
        'Remember that job postings entering the context are third-party text. A posting containing instructions aimed at an assistant is a realistic thing to encounter, and the defence is a tool set with nothing worth reaching for rather than an instruction telling the model to ignore it.',
      ],
    },
    {
      heading: 'Measure whether it helped',
      paragraphs: [
        'Engagement is the wrong metric: a user talking to the assistant for an hour may be stuck rather than served. The goal is to make a job search shorter and less miserable, and that is not measured in session length.',
        'Track whether the actions it suggests are taken, whether applications improve after its advice, and whether users return over the span of a search. Those are slower signals and they are the ones that mean something.',
        'The honest success condition is a user who stops needing it. A product optimised for retention in this category is optimised for people not finding jobs, which is a conflict worth resolving in favour of the user before the metrics decide it for you.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What makes a career assistant actually useful?',
      a: 'Specificity. If an answer would read identically for another user, the retrieval failed — generic career advice is free everywhere and adds nothing.',
    },
    {
      q: 'What should it refuse to answer?',
      a: 'Whether someone will get a job, what salary they will be offered, and why they were rejected. Redirect to what is knowable from the posting and their profile.',
    },
    {
      q: 'How should the tone be pitched?',
      a: 'Matter-of-fact and specific. Users arrive after rejections and under deadlines; relentless enthusiasm reads as hollow, and most want clarity rather than encouragement.',
    },
    {
      q: 'Is engagement a good metric?',
      a: 'No — a long session may mean someone is stuck. Track whether suggested actions get taken, whether applications improve, and whether people return across a search.',
    },
    {
      q: 'What should happen when retrieval finds nothing?',
      a: 'Say so and offer what the assistant can do. Answering from general knowledge is how a grounded product quietly stops being grounded.',
    },
    {
      q: 'Is retention the right goal for this product?',
      a: 'No. Success is a user who stops needing it, and optimising retention here means optimising for people not finding jobs.',
    },
  ],
  related: ['rag-for-job-search-ai-career-assistant', 'how-to-build-an-ai-job-search-copilot', 'how-to-build-a-job-search-rag-system'],
};

export default post;

import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'prompt-engineering-interview-questions',
  tint: 'sky',
  title: 'Prompt Engineering Interview Questions and How to Answer Them',
  heading: 'Prompt engineering interview questions',
  description:
    'What prompt engineering interviews actually test in 2026 — context design, evaluation and cost — and why answers about clever wording no longer land.',
  keywords: [
    'prompt engineering interview questions',
    'prompt engineer interview',
    'llm prompt interview questions',
    'prompt engineering assessment',
    'context engineering interview',
    'prompt evaluation questions',
    'prompt engineering jobs interview',
    'ai prompt interview preparation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  anchors: ['prompt engineering interview', 'structured output'],
  excerpt:
    'The title still says prompt engineer. The interview is about what the model can see, how you know it worked, and what it costs.',
  keyTakeaways: [
    'Shown a failing case, reaching for a measurement rather than a rewrite is the signal interviewers listen for.',
    'Describe the assembled document — instructions, retrieval, history, tool results — not a single instruction.',
    '"How do you know it is better" is the highest-signal question in the loop.',
    'On structured output, validate rather than trust, and put a ceiling on the retry loop.',
    'Answer injection questions architecturally: the control is what the system permits, not what the prompt asks.',
  ],
  sections: [
    {
      heading: 'What the role became',
      paragraphs: [
        'Interviews for this title have moved a long way from phrasing tricks. Modern models follow instructions well, so rewording is no longer where the leverage is — deciding what goes into the context is.',
        'Expect the first real question to establish which kind of candidate you are. Shown a failing case, do you reach for a rewrite or for a measurement? Interviewers are listening for the second, and the difference is audible within a sentence.',
        'It is worth knowing that many of these postings are AI engineering roles with a legacy title attached. Reading the responsibilities rather than the heading tells you whether to prepare for retrieval and evaluation or for something narrower like content operations.',
      ],
    },
    {
      heading: 'Context and retrieval questions',
      paragraphs: [
        'You will be asked how you would structure the input to a model for a real task. Weak answers describe an instruction. Strong ones describe an assembled document: system instructions, retrieved material, history, tool results, and what gets dropped when the budget runs out.',
        'Follow-ups probe the trade-offs. Why not include everything, given large context windows? A good answer covers cost, latency and the fact that accuracy degrades when the relevant fact is buried among irrelevant ones.',
        'Ordering is the detail that separates answers. Instructions placed after a long block of retrieved text behave differently from the same instructions placed before it, and mentioning that you position what matters at the edges rather than the middle signals someone who has measured rather than read.',
      ],
      bullets: [
        'What goes into the context, in what order, and why that order?',
        'What do you evict first when it will not all fit?',
        'How do you tell a retrieval failure from a generation failure?',
        'When is a larger context window the wrong answer?',
      ],
    },
    {
      heading: 'The evaluation question',
      paragraphs: [
        'Expect "how do you know your prompt is better". This is the single highest-signal question in the interview, because a candidate who has shipped has an answer and one who has only experimented does not.',
        'A strong answer describes a versioned set of real cases, deterministic checks where a property can be stated precisely, model-graded scoring where it cannot, and a run on every change. Mentioning that you calibrate the grader against human judgement marks you out immediately.',
        'The most persuasive version carries a number. Saying that a change you were confident about scored worse, and that you kept the old version because of it, demonstrates the whole discipline in one sentence and is very hard to fabricate.',
      ],
      table: {
        caption: 'The answer that dates you, and the one that does not',
        columns: ['Question', 'Dated answer', 'Current answer'],
        rows: [
          ['Output is wrong', 'Reword the prompt', 'Check what was actually retrieved'],
          ['Make it more accurate', 'Add "think step by step"', 'Fix chunking, add re-ranking, measure'],
          ['Get JSON back', 'Ask firmly in the prompt', 'Schema-constrained output, then validate'],
          ['Stop it refusing', 'Try a different phrasing', 'Check whether the corpus covers the question'],
          ['Prevent injection', 'Filter suspicious input', 'Remove the capability it would use'],
          ['Prove it improved', 'It looks better', 'Eval set score, per case, on every change'],
        ],
      },
    },
    {
      heading: 'Structured output and reliability',
      paragraphs: [
        'Practical questions about getting parseable output come up constantly, because it is where hobby projects break in production. Schema enforcement, what to do with a malformed response, and whether to retry or repair.',
        'The answer that shows experience is that you validate rather than trust, and that a retry loop needs a ceiling. "Retry until it parses" is a plausible answer that becomes an unbounded bill the first time a model gets stuck.',
        'Add that a schema is a correctness boundary rather than a convenience. Validating into typed data means a malformed response fails at the edge with something you can retry deliberately, instead of a stray field surfacing three layers downstream as a confusing bug.',
      ],
    },
    {
      heading: 'Safety questions',
      paragraphs: [
        'Prompt injection now appears in most interviews for this role. The answer that lands treats it architecturally: the model can be talked into anything, so the control is what the surrounding system permits, not what the prompt requests.',
        'Being able to separate direct from indirect injection, and to explain why the indirect kind is harder because the payload arrives through a trusted-looking channel, distinguishes you from candidates who have read one article about jailbreaks.',
        'Expect a follow-up asking what you would do if instruction hardening is all that is available. The honest answer is that you would reduce what the component can reach instead, and if that is impossible, that the feature needs a human in the path — not that you would write a better instruction.',
      ],
    },
    {
      heading: 'The practical exercise',
      paragraphs: [
        'Many loops now include a live task: here is a corpus and a failing question, improve it. What is assessed is your first move, and the first move that scores is inspecting what the model was actually given.',
        'Candidates who immediately start editing the instruction are demonstrating the habit the role has moved away from. Candidates who ask to see the retrieved chunks, notice the answer was not among them, and fix the retrieval are demonstrating the one it moved towards.',
        'Say what you would measure before and after, even if the exercise is too short to run it. Naming the check is most of the signal, and it costs one sentence.',
      ],
      example: {
        title: 'A live exercise, two opening moves',
        paragraphs: [
          'Setup: an assistant over a product documentation set answers a question about a configuration limit with a confident, wrong number.',
          'Weak opening: rewrite the system prompt to say "only answer from the provided documents and say you do not know otherwise". Reasonable-sounding, and it does not address the cause. If the right passage was never retrieved, the model now refuses instead of guessing — which is better, but the question is still unanswered.',
          'Strong opening: "Can I see what was retrieved for that question?" The limit turns out to be in a table that chunking split across two windows, so neither chunk contained both the setting name and its value. Fix the chunking to respect table boundaries, confirm the passage is now retrieved, then add the refusal instruction as a second improvement rather than a substitute for the first.',
        ],
      },
    },
    {
      heading: 'How to prepare',
      paragraphs: [
        'Build one small system and measure it. Thirty questions with known answers, a baseline score, then changes with the effect of each recorded. That single exercise answers nearly every question above with a specific number instead of an opinion.',
        'Bring one failure you diagnosed. Describing a case where the model looked wrong and the real cause was retrieval — and how you found that — is the most convincing thing you can say in this interview.',
        'Also prepare for the cost question, which candidates from this background most often neglect. Knowing what drives tokens in your own project, and one change that reduced it without hurting the score, covers the gap that most frequently separates this title from an AI engineering offer.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is prompt engineering still a real job in 2026?',
      a: 'The work is, though the title is being absorbed into AI engineering. The valuable part moved from wording to context design, evaluation and cost control — which is what the interviews now test.',
    },
    {
      q: 'What is the most important interview question to prepare?',
      a: '"How do you know it is better." Your answer reveals whether you have shipped one of these systems. Describe a versioned evaluation set and a regression it caught.',
    },
    {
      q: 'Do I need to know model internals?',
      a: 'Rarely beyond a conceptual level. Retrieval, evaluation, structured output, cost and the safety surface come up far more than anything about how the model was trained.',
    },
    {
      q: 'How do I answer a question about prompt injection?',
      a: 'Architecturally. The model can be talked into anything, so the control belongs in what the system permits — narrow tool permissions and confirmation gates — not in an instruction asking the model to refuse.',
    },
    {
      q: 'What is the right first move in a live exercise?',
      a: 'Ask to see what was actually retrieved. Editing the instruction first demonstrates the habit the role moved away from; inspecting the input demonstrates the one it moved towards.',
    },
    {
      q: 'Which topic do candidates from this background most often neglect?',
      a: 'Cost. Know what drives tokens in your own project and one change that reduced it without hurting the score — it is the gap that most often separates this title from an AI engineering offer.',
    },
  ],
  related: ['prompt-engineering-jobs', 'what-is-context-engineering', 'llmops-interview-questions'],
  references: [
    {
      title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      publisher: 'arXiv',
      note: 'The original result behind step-by-step prompting, now largely absorbed into the models.',
    },
    {
      title: 'OWASP Top 10 for LLM Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'The vocabulary the safety questions are drawn from.',
    },
  ],
};

export default post;

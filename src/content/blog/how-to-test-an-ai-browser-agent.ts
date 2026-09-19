import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-test-an-ai-browser-agent',
  tint: 'sky',
  title: 'How to Test an AI Browser Agent',
  heading: 'Testing a browser agent',
  description:
    'Testing something non-deterministic that acts on live sites: recorded fixtures, trajectory assertions, adversarial pages and knowing what to run against production.',
  keywords: [
    'test ai browser agent',
    'agent testing strategy',
    'non deterministic testing',
    'browser agent fixtures',
    'trajectory testing agents',
    'agent regression testing',
    'record and replay testing',
    'agent evaluation harness',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'You cannot assert an exact sequence against a non-deterministic system, and you cannot run your suite against real employers. Both problems have the same answer.',
  sections: [
    {
      heading: 'Two problems at once',
      paragraphs: [
        'Testing a browser agent is awkward for two independent reasons. The agent is non-deterministic, so the same input can produce a different but equally valid path. And the targets are live third-party sites, so you cannot hit them repeatedly without being blocked or submitting real applications.',
        'Solve the second with recorded fixtures and the first by asserting on outcomes rather than on steps. Almost everything else follows from those two decisions.',
      ],
    },
    {
      heading: 'Record real pages, replay them offline',
      paragraphs: [
        'Capture the pages your agent encounters — the full DOM, not a screenshot — and serve them from a local fixture server. Your suite then runs against realistic markup, deterministically, at no cost and with no risk of submitting anything.',
        'Refresh these recordings periodically. A fixture set that has drifted a year from reality gives you a green suite and an agent that no longer works, which is worse than no suite because it is falsely reassuring.',
      ],
      bullets: [
        'Record the real DOM from live pages, then serve locally',
        'One fixture per distinct form shape, not per employer',
        'Include the awkward ones: multi-step, conditional fields, validation errors',
        'Re-record on a schedule and diff against the previous capture',
      ],
    },
    {
      heading: 'Assert outcomes, not sequences',
      paragraphs: [
        'An agent that fills the form in a different order has not failed. Asserting an exact step sequence produces a suite that breaks constantly for reasons nobody cares about, and teams quickly learn to ignore it.',
        'Assert the end state instead: every required field holds the correct value, no forbidden field was touched, the submission button was reached. Then add bounds on the path — under this many steps, under this cost — so an agent that flails its way to the right answer still fails.',
      ],
    },
    {
      heading: 'Test the failures deliberately',
      paragraphs: [
        'The interesting cases are not the happy path. Build fixtures that break things on purpose and assert that the agent stops rather than improvises, because improvising is its default and is exactly what you need to prevent.',
        'A question it has never seen, a session that has expired, a form that rejects a value, a page that loads content late. In each case the correct behaviour is escalation, and that must be asserted rather than hoped for.',
      ],
    },
    {
      heading: 'Include adversarial fixtures',
      paragraphs: [
        'Add pages carrying injected instructions — a job description telling the agent to email its data elsewhere, hidden text redirecting it. Assert that it does neither.',
        'Keep these in the standing suite rather than running them once. Injection resistance degrades whenever the prompt, the tools or the model change, so it belongs alongside your functional tests and not in a one-off security review.',
      ],
    },
    {
      heading: 'What still needs live runs',
      paragraphs: [
        'Fixtures cannot tell you that an employer redesigned their form last week. Keep a small scheduled run against real sites that stops short of submitting — navigate, fill, verify the state, never click the final button.',
        'That gives you an early warning on drift without side effects, and it is the only thing that catches the class of failure where your fixtures are perfect and the world has changed.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do you test something non-deterministic?',
      a: 'Assert on outcomes rather than step sequences — the right values in the right fields, nothing forbidden touched — plus bounds on steps and cost so an agent that flails to the right answer still fails.',
    },
    {
      q: 'How do I test without submitting real applications?',
      a: 'Record the real DOM from live pages and replay it from a local fixture server. Deterministic, free, and no risk of a real submission — but refresh the recordings or they drift into false reassurance.',
    },
    {
      q: 'What should adversarial fixtures check?',
      a: 'That an injected instruction in a job description or hidden page text does not change what the agent does. Keep them in the standing suite, since resistance degrades whenever prompts, tools or models change.',
    },
    {
      q: 'Do I still need to run against live sites?',
      a: 'Yes, on a schedule and stopping before the final submit. Fixtures cannot tell you an employer redesigned their form, and that drift is invisible until something real fails.',
    },
  ],
  related: ['how-to-build-reliable-browser-automation', 'how-to-build-reliable-ai-agents', 'how-to-secure-an-ai-browser-agent'],
};

export default post;

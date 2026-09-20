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
  anchors: ['testing a browser agent', 'recorded fixtures'],
  excerpt:
    'You cannot assert an exact sequence against a non-deterministic system, and you cannot run your suite against real employers. Both problems have the same answer.',
  keyTakeaways: [
    'Two independent problems: non-determinism, and targets you must not hit repeatedly.',
    'Record the real DOM and replay it locally; refresh it or the suite becomes false reassurance.',
    'Assert end state plus bounds on steps and cost, never an exact sequence.',
    'Test the failures deliberately, because improvising is the agent’s default.',
    'Keep adversarial fixtures standing — injection resistance degrades with every change.',
  ],
  sections: [
    {
      heading: 'Two problems at once',
      paragraphs: [
        'Testing a browser agent is awkward for two independent reasons. The agent is non-deterministic, so the same input can produce a different but equally valid path. And the targets are live third-party sites, so you cannot hit them repeatedly without being blocked or submitting real applications.',
        'Solve the second with recorded fixtures and the first by asserting on outcomes rather than on steps. Almost everything else follows from those two decisions.',
        'Non-determinism also means a single pass proves very little. Run each scenario several times and treat a step that succeeds four times in five as a flaky step you want to know about, rather than as a pass.',
      ],
    },
    {
      heading: 'Record real pages, replay them offline',
      paragraphs: [
        'Capture the pages your agent encounters — the full DOM, not a screenshot — and serve them from a local fixture server. Your suite then runs against realistic markup, deterministically, at no cost and with no risk of submitting anything.',
        'Refresh these recordings periodically. A fixture set that has drifted a year from reality gives you a green suite and an agent that no longer works, which is worse than no suite because it is falsely reassuring.',
        'Scrub what you capture. Recorded pages from a real application flow can contain a candidate’s details or a session token, and a fixture directory in version control is not a place for either.',
      ],
      bullets: [
        'Record the real DOM from live pages, then serve locally',
        'One fixture per distinct form shape, not per employer',
        'Include the awkward ones: multi-step, conditional fields, validation errors',
        'Re-record on a schedule and diff against the previous capture',
      ],
      table: {
        caption: 'What each kind of test can tell you',
        columns: ['Test', 'Catches', 'Cannot catch'],
        rows: [
          ['Fixture replay', 'Logic and prompt regressions', 'A site that changed'],
          ['Failure fixtures', 'Improvising instead of stopping', 'Real-world novelty'],
          ['Adversarial fixtures', 'Injection resistance decay', 'Novel attack shapes'],
          ['Trajectory bounds', 'Flailing to the right answer', 'Wrong answers arrived at neatly'],
          ['Scheduled live run', 'Drift in real sites', 'Anything about correctness'],
        ],
      },
    },
    {
      heading: 'Assert outcomes, not sequences',
      paragraphs: [
        'An agent that fills the form in a different order has not failed. Asserting an exact step sequence produces a suite that breaks constantly for reasons nobody cares about, and teams quickly learn to ignore it.',
        'Assert the end state instead: every required field holds the correct value, no forbidden field was touched, the submission button was reached. Then add bounds on the path — under this many steps, under this cost — so an agent that flails its way to the right answer still fails.',
        'Assert the negatives explicitly. That the demographic section was left untouched, that no salary figure was entered, that nothing was submitted without a recorded confirmation — those are the properties that matter most and the ones an end-state check on required fields will not cover.',
      ],
    },
    {
      heading: 'Test the failures deliberately',
      paragraphs: [
        'The interesting cases are not the happy path. Build fixtures that break things on purpose and assert that the agent stops rather than improvises, because improvising is its default and is exactly what you need to prevent.',
        'A question it has never seen, a session that has expired, a form that rejects a value, a page that loads content late. In each case the correct behaviour is escalation, and that must be asserted rather than hoped for.',
        'Add the interruption cases too. A flow that presents a verification wall halfway, or a session that expires at step four, should produce a clean pause with resumable state — and a test that restarts the same scenario twice should never produce two submissions.',
      ],
    },
    {
      heading: 'Include adversarial fixtures',
      paragraphs: [
        'Add pages carrying injected instructions — a job description telling the agent to email its data elsewhere, hidden text redirecting it. Assert that it does neither.',
        'Keep these in the standing suite rather than running them once. Injection resistance degrades whenever the prompt, the tools or the model change, so it belongs alongside your functional tests and not in a one-off security review.',
        'Assert on the architecture rather than only on the behaviour. A test confirming that the agent has no tool capable of the requested action is a stronger and more durable guarantee than one confirming it declined this particular phrasing.',
      ],
    },
    {
      heading: 'What still needs live runs',
      paragraphs: [
        'Fixtures cannot tell you that an employer redesigned their form last week. Keep a small scheduled run against real sites that stops short of submitting — navigate, fill, verify the state, never click the final button.',
        'That gives you an early warning on drift without side effects, and it is the only thing that catches the class of failure where your fixtures are perfect and the world has changed.',
        'Monitor production for the same drift rather than relying on the scheduled run alone. A per-platform success rate, a rising proportion of unmapped fields and a climbing fall-through to the generic path all signal a changed site days before anyone reports it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do you test something non-deterministic?',
      a: 'Assert on outcomes rather than step sequences, add bounds on steps and cost, and run each scenario several times — one pass proves very little.',
    },
    {
      q: 'How do I test without submitting real applications?',
      a: 'Record the real DOM from live pages and replay it from a local fixture server — scrubbed of candidate data — and refresh the recordings or they drift into false reassurance.',
    },
    {
      q: 'What should adversarial fixtures check?',
      a: 'That an injected instruction changes nothing — and, more durably, that no tool capable of the requested action exists at all.',
    },
    {
      q: 'Do I still need to run against live sites?',
      a: 'Yes, on a schedule and stopping before the final submit, plus production monitoring of per-platform success rates, which catches drift days earlier.',
    },
    {
      q: 'What negatives should the suite assert?',
      a: 'That demographic sections were untouched, no salary was entered, and nothing was submitted without a recorded confirmation. End-state checks on required fields miss all three.',
    },
    {
      q: 'How do I test interruption handling?',
      a: 'With fixtures that present a verification wall or expire a session mid-flow — and by restarting the same scenario twice to confirm it never produces two submissions.',
    },
  ],
  related: ['how-to-build-reliable-browser-automation', 'how-to-build-reliable-ai-agents', 'how-to-secure-an-ai-browser-agent'],
};

export default post;

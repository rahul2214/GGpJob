import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-ai-agents-understand-web-pages',
  tint: 'sky',
  title: 'How AI Agents Understand Web Pages and Click Buttons',
  heading: 'How agents read a page',
  description:
    'What an AI agent actually receives when it looks at a web page, why raw HTML does not work, and how it decides which element to click.',
  keywords: [
    'how ai agents read web pages',
    'accessibility tree ai agent',
    'dom for llm agents',
    'agent element selection',
    'set of marks prompting',
    'ai clicking elements',
    'web page representation llm',
    'browser agent internals',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'A model cannot see a web page. Everything depends on how you turn one into text or images it can work with, and that choice decides cost and accuracy.',
  sections: [
    {
      heading: 'Raw HTML does not work',
      paragraphs: [
        'The obvious approach — send the page source — fails immediately on real sites. A modern page is often hundreds of kilobytes of markup, most of it framework wrappers, inline styles and analytics, with the actual content scattered thinly through it.',
        'That is both unaffordable in tokens and actively harmful to accuracy, because the signal is buried. Every working browser agent therefore transforms the page into something much smaller before the model sees it.',
      ],
    },
    {
      heading: 'The accessibility tree is the usual answer',
      paragraphs: [
        'Browsers already build a structured description of a page for screen readers: what each element is, its label, its state, whether it is interactive. That tree is compact, semantically meaningful, and available through standard automation interfaces.',
        'It is close to ideal for this purpose. A button appears as a button with its accessible name rather than as a nest of divs, which is exactly the abstraction a model needs to decide what to click.',
      ],
      bullets: [
        'Element role — button, textbox, link, checkbox',
        'Accessible name — the label a screen reader would announce',
        'State — disabled, checked, expanded, required',
        'Structure — what contains what, so context is preserved',
      ],
    },
    {
      heading: 'When screenshots are necessary',
      paragraphs: [
        'Some meaning is only visual: which option is highlighted, that an error appeared in red beside a field, that a button is visually disabled without being marked so, that a modal is covering the form.',
        'For these a screenshot is sent instead of or alongside the tree. It costs considerably more per step, so most systems use structure by default and reach for the image when the structural view is ambiguous or an action unexpectedly failed.',
      ],
    },
    {
      heading: 'How it picks an element',
      paragraphs: [
        'The common technique assigns each interactive element a numeric label and shows the model the labelled list, or a screenshot with those numbers drawn on it. The model then says "click 14" rather than describing a selector.',
        'This is a deliberate design choice. Asking a model to produce a CSS selector invites it to invent a plausible one that matches nothing; constraining it to choose from an enumerated list of elements that genuinely exist eliminates that failure entirely.',
      ],
    },
    {
      heading: 'Why it still gets it wrong',
      paragraphs: [
        'Pages defeat this in predictable ways. Elements with no accessible name appear as an unlabelled button among six others. Content loads after the snapshot, so the model reasons about a page that no longer exists. Custom components built from divs do not report a role.',
        'The practical mitigations are unglamorous: wait for the page to settle before snapshotting, re-snapshot after any action, and verify the expected change actually happened rather than assuming the click landed where intended.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Does an AI agent read the HTML of a page?',
      a: 'Rarely the raw HTML — it is too large and too noisy. Most agents use the accessibility tree, a compact structured description of what each element is, what it is called and what state it is in.',
    },
    {
      q: 'When do browser agents use screenshots?',
      a: 'When meaning is visual: a highlighted option, a red error beside a field, a modal covering the form. Screenshots cost far more per step, so they are usually a fallback rather than the default.',
    },
    {
      q: 'How does an agent decide what to click?',
      a: 'Interactive elements are enumerated and labelled, and the model chooses a number. Asking it to write a CSS selector invites it to invent one that matches nothing.',
    },
    {
      q: 'Why do browser agents click the wrong thing?',
      a: 'Usually unlabelled elements, content that loaded after the snapshot, or custom components that report no role. Re-snapshot after every action and verify the expected change actually occurred.',
    },
  ],
  related: ['what-is-browser-ai', 'how-to-build-an-ai-browser-agent-with-playwright', 'how-to-build-reliable-browser-automation'],
};

export default post;

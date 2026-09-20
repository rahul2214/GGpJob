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
  anchors: ['accessibility tree', 'how agents read a page'],
  excerpt:
    'A model cannot see a web page. Everything depends on how you turn one into text or images it can work with, and that choice decides cost and accuracy.',
  keyTakeaways: [
    'Raw HTML is unaffordable in tokens and actively harmful to accuracy, because the signal is buried.',
    'The accessibility tree is the usual representation: roles, names, states and structure.',
    'Screenshots cost far more per step and are a fallback for meaning that is purely visual.',
    'Agents pick from an enumerated list of real elements rather than writing selectors they might invent.',
    'Most failures are stale snapshots or unlabelled elements — re-snapshot and verify after every action.',
  ],
  sections: [
    {
      heading: 'Raw HTML does not work',
      paragraphs: [
        'The obvious approach — send the page source — fails immediately on real sites. A modern page is often hundreds of kilobytes of markup, most of it framework wrappers, inline styles and analytics, with the actual content scattered thinly through it.',
        'That is both unaffordable in tokens and actively harmful to accuracy, because the signal is buried. Every working browser agent therefore transforms the page into something much smaller before the model sees it.',
        'The scale of the reduction is the point. A page that is three hundred kilobytes of markup frequently reduces to two or three kilobytes of structured description, and the smaller version is both cheaper and easier to reason about.',
      ],
    },
    {
      heading: 'The accessibility tree is the usual answer',
      paragraphs: [
        'Browsers already build a structured description of a page for screen readers: what each element is, its label, its state, whether it is interactive. That tree is compact, semantically meaningful, and available through standard automation interfaces.',
        'It is close to ideal for this purpose. A button appears as a button with its accessible name rather than as a nest of divs, which is exactly the abstraction a model needs to decide what to click.',
        'There is a pleasing consequence here: sites built properly for screen readers are also the easiest for agents to operate. Accessibility work that was done for people turns out to be the thing that makes automation reliable, and sites that skipped it are hard for both.',
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
        'The cost difference is large enough to change architecture. An agent that screenshots every step can be an order of magnitude more expensive than one that reads structure and falls back, which is why the hybrid approach is close to universal in production.',
      ],
      table: {
        caption: 'Page representations compared',
        columns: ['Representation', 'Cost per step', 'Best for', 'Fails on'],
        rows: [
          ['Raw HTML', 'Very high', 'Almost nothing', 'Everything at real page size'],
          ['Accessibility tree', 'Low', 'Most interaction', 'Custom divs with no role'],
          ['Screenshot', 'High', 'Visual-only meaning', 'Precise element targeting'],
          ['Tree plus numbered marks', 'Low to moderate', 'Reliable clicking', 'Elements added after snapshot'],
        ],
      },
    },
    {
      heading: 'How it picks an element',
      paragraphs: [
        'The common technique assigns each interactive element a numeric label and shows the model the labelled list, or a screenshot with those numbers drawn on it. The model then says "click 14" rather than describing a selector.',
        'This is a deliberate design choice. Asking a model to produce a CSS selector invites it to invent a plausible one that matches nothing; constraining it to choose from an enumerated list of elements that genuinely exist eliminates that failure entirely.',
        'It is the same principle as a dropdown rather than a free-text field. Removing the opportunity to produce something invalid is more reliable than validating afterwards, and it applies to model output as much as to user input.',
      ],
      example: {
        title: 'What the model actually receives',
        paragraphs: [
          'Rather than markup, the model is given something closer to a list: [1] link "Jobs", [2] textbox "Search job titles", [3] combobox "Location" collapsed, [4] button "Search", [5] checkbox "Remote only" unchecked, [6] button "Apply now" disabled.',
          'From that it can reason usefully — the apply button is disabled, so something earlier is incomplete; the location control is collapsed, so it must be opened before a value can be set. None of that reasoning is available from a wall of divs.',
          'And the action it returns is constrained: type into 2, click 4. There is no opportunity to invent an element that does not exist, because it can only name numbers it was given.',
        ],
      },
    },
    {
      heading: 'Why it still gets it wrong',
      paragraphs: [
        'Pages defeat this in predictable ways. Elements with no accessible name appear as an unlabelled button among six others. Content loads after the snapshot, so the model reasons about a page that no longer exists. Custom components built from divs do not report a role.',
        'The practical mitigations are unglamorous: wait for the page to settle before snapshotting, re-snapshot after any action, and verify the expected change actually happened rather than assuming the click landed where intended.',
        'The stale snapshot is the most common of these by a wide margin. Modern pages render progressively, and a snapshot taken a few hundred milliseconds early produces an element list that is already wrong by the time the model responds.',
      ],
      bullets: [
        'Unlabelled controls — several identical "button" entries with no name',
        'Content that appears after the snapshot was taken',
        'Custom components that report no role or state',
        'Overlays and cookie banners intercepting the click',
        'Elements present in the tree but scrolled out of the viewport',
      ],
    },
    {
      heading: 'What this means if you build web pages',
      paragraphs: [
        'Agents are becoming a category of visitor, and the things that make a page legible to them are the things that already made it legible to assistive technology. Semantic elements, real labels, accurate disabled and expanded states.',
        'A page built from divs with click handlers is hostile to screen readers and to agents for exactly the same reason: nothing in it declares what anything is. That is now a commercial consideration as well as an accessibility one.',
        'For a careers site in particular this matters. If candidates increasingly reach your application form through some kind of assistant, a form that no automated client can complete is a form that quietly loses applicants you never hear from.',
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
    {
      q: 'Does accessibility work help AI agents?',
      a: 'Directly. Semantic elements, real labels and accurate states are exactly what the accessibility tree exposes, so a site built properly for screen readers is the easiest kind for an agent to operate.',
    },
    {
      q: 'What is the most common cause of agent misclicks?',
      a: 'A stale snapshot. Pages render progressively, so a capture taken a few hundred milliseconds early describes a layout that has already changed by the time the model responds.',
    },
  ],
  related: ['what-is-browser-ai', 'how-to-build-an-ai-browser-agent-with-playwright', 'how-to-build-reliable-browser-automation'],
  references: [
    {
      title: 'ARIA',
      url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA',
      publisher: 'MDN Web Docs',
      note: 'Roles, names and states — the vocabulary the accessibility tree is built from.',
    },
    {
      title: 'Locators',
      url: 'https://playwright.dev/docs/locators',
      publisher: 'Playwright',
      note: 'Why role and label based targeting is more robust than CSS selectors.',
    },
  ],
};

export default post;

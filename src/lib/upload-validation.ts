import crypto from 'crypto';

/**
 * Upload hardening.
 *
 * The browser-supplied filename and Content-Type are attacker-controlled and are
 * never trusted for a security decision. A file is accepted only when its
 * extension, its declared MIME type AND its leading magic bytes all agree on a
 * type that is on the allowlist. Stored object keys are always regenerated
 * server-side so a malicious filename cannot traverse or collide.
 */

export interface FileTypeRule {
  extensions: string[];
  mimeTypes: string[];
  /** Byte signatures; an empty list means "content sniffing not applicable". */
  magic: number[][];
}

export const RESUME_FILE_RULES: Record<string, FileTypeRule> = {
  pdf: {
    extensions: ['pdf'],
    mimeTypes: ['application/pdf'],
    magic: [[0x25, 0x50, 0x44, 0x46]], // %PDF
  },
  docx: {
    extensions: ['docx'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    magic: [[0x50, 0x4b, 0x03, 0x04], [0x50, 0x4b, 0x05, 0x06], [0x50, 0x4b, 0x07, 0x08]], // ZIP
  },
  doc: {
    extensions: ['doc'],
    mimeTypes: ['application/msword'],
    magic: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]], // OLE2 compound file
  },
};

export const IMAGE_FILE_RULES: Record<string, FileTypeRule> = {
  jpeg: {
    extensions: ['jpg', 'jpeg', 'jfif'],
    mimeTypes: ['image/jpeg', 'image/pjpeg'],
    magic: [[0xff, 0xd8, 0xff]],
  },
  png: {
    extensions: ['png'],
    mimeTypes: ['image/png'],
    magic: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
  webp: {
    extensions: ['webp'],
    // RIFF....WEBP — the first four bytes are checked, "WEBP" is verified below.
    mimeTypes: ['image/webp'],
    magic: [[0x52, 0x49, 0x46, 0x46]],
  },
  gif: {
    extensions: ['gif'],
    mimeTypes: ['image/gif'],
    magic: [[0x47, 0x49, 0x46, 0x38]],
  },
};

export interface ValidationSuccess {
  ok: true;
  /** Canonical extension chosen by the server, never the client's. */
  extension: string;
  /** Canonical MIME type chosen by the server, never the client's. */
  contentType: string;
}

export interface ValidationFailure {
  ok: false;
  error: string;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

function matchesMagic(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) return false;
  return signature.every((byte, i) => buffer[i] === byte);
}

/** Extracts a lowercase extension from an untrusted filename, without any path parts. */
export function safeExtension(filename: string): string {
  const base = String(filename || '').split(/[\/]/).pop() || '';
  const idx = base.lastIndexOf('.');
  if (idx === -1 || idx === base.length - 1) return '';
  return base.slice(idx + 1).toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Validates a buffer against a rule set. Returns the server-decided extension
 * and content type; callers must use those rather than the client's values.
 */
export function validateFileContent(
  buffer: Buffer,
  filename: string,
  declaredMime: string,
  rules: Record<string, FileTypeRule>,
): ValidationResult {
  const ext = safeExtension(filename);
  if (!ext) {
    return { ok: false, error: 'File must have a recognised extension.' };
  }

  const entry = Object.entries(rules).find(([, rule]) => rule.extensions.includes(ext));
  if (!entry) {
    const allowed = Object.values(rules).flatMap(r => r.extensions).join(', ');
    return { ok: false, error: `Unsupported file type. Allowed: ${allowed}.` };
  }

  const [, rule] = entry;

  // The declared MIME type must agree with the extension. Browsers occasionally
  // send an empty type, which we tolerate because the magic-byte check below is
  // the authoritative test.
  const mime = String(declaredMime || '').split(';')[0].trim().toLowerCase();
  if (mime && !rule.mimeTypes.includes(mime)) {
    return { ok: false, error: 'File content type does not match its extension.' };
  }

  if (rule.magic.length > 0) {
    const magicOk = rule.magic.some(sig => matchesMagic(buffer, sig));
    if (!magicOk) {
      return { ok: false, error: 'File contents do not match the declared file type.' };
    }
    // RIFF is shared by several formats; confirm the WEBP fourcc specifically.
    if (ext === 'webp' && buffer.subarray(8, 12).toString('ascii') !== 'WEBP') {
      return { ok: false, error: 'File contents do not match the declared file type.' };
    }
  }

  return { ok: true, extension: rule.extensions[0], contentType: rule.mimeTypes[0] };
}

/**
 * Builds a storage key from server-controlled components only. The user id is
 * constrained to a safe character class and the filename is discarded entirely,
 * so neither can introduce traversal segments.
 */
export function buildStorageKey(prefix: string, ownerId: string | number, extension: string): string {
  const safeOwner = String(ownerId).replace(/[^a-zA-Z0-9_-]/g, '');
  const safePrefix = String(prefix).replace(/[^a-zA-Z0-9_-]/g, '');
  const safeExt = String(extension).replace(/[^a-z0-9]/g, '') || 'bin';
  const nonce = crypto.randomBytes(16).toString('hex');
  return `${safePrefix}/${safeOwner}/${Date.now()}-${nonce}.${safeExt}`;
}

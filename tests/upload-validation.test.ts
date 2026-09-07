import { describe, it, expect } from 'vitest';
import {
  validateFileContent,
  buildStorageKey,
  safeExtension,
  RESUME_FILE_RULES,
  IMAGE_FILE_RULES,
} from '@/lib/upload-validation';

const PDF = Buffer.from('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n', 'binary');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
const HTML = Buffer.from('<html><body><script>alert(document.cookie)</script></body></html>');
const PE_EXE = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);

/**
 * Regression tests for VULN-006 / VULN-007 (unrestricted upload types on the
 * resume and profile-photo endpoints). The client's filename and Content-Type
 * must never be sufficient to get a file accepted.
 */
describe('Upload validation — resumes', () => {
  it('accepts a genuine PDF', () => {
    const r = validateFileContent(PDF, 'cv.pdf', 'application/pdf', RESUME_FILE_RULES);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.extension).toBe('pdf');
      expect(r.contentType).toBe('application/pdf');
    }
  });

  it('accepts a genuine DOCX (ZIP container)', () => {
    const r = validateFileContent(
      ZIP,
      'cv.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      RESUME_FILE_RULES,
    );
    expect(r.ok).toBe(true);
  });

  it('rejects HTML renamed to .pdf even when the MIME type lies', () => {
    const r = validateFileContent(HTML, 'payload.pdf', 'application/pdf', RESUME_FILE_RULES);
    expect(r.ok).toBe(false);
  });

  it('rejects a Windows executable renamed to .pdf', () => {
    const r = validateFileContent(PE_EXE, 'malware.pdf', 'application/pdf', RESUME_FILE_RULES);
    expect(r.ok).toBe(false);
  });

  it('rejects a disallowed extension outright', () => {
    expect(validateFileContent(PE_EXE, 'malware.exe', 'application/octet-stream', RESUME_FILE_RULES).ok).toBe(false);
    expect(validateFileContent(HTML, 'page.html', 'text/html', RESUME_FILE_RULES).ok).toBe(false);
    expect(validateFileContent(SVG, 'x.svg', 'image/svg+xml', RESUME_FILE_RULES).ok).toBe(false);
  });

  it('rejects a file with no extension', () => {
    expect(validateFileContent(PDF, 'resume', 'application/pdf', RESUME_FILE_RULES).ok).toBe(false);
  });

  it('rejects a MIME type that disagrees with the extension', () => {
    expect(validateFileContent(PDF, 'cv.pdf', 'text/html', RESUME_FILE_RULES).ok).toBe(false);
  });
});

describe('Upload validation — profile photos', () => {
  it('accepts a genuine PNG and JPEG', () => {
    expect(validateFileContent(PNG, 'me.png', 'image/png', IMAGE_FILE_RULES).ok).toBe(true);
    expect(validateFileContent(JPEG, 'me.jpg', 'image/jpeg', IMAGE_FILE_RULES).ok).toBe(true);
  });

  it('rejects SVG, which can carry script and would run from the storage origin', () => {
    expect(validateFileContent(SVG, 'avatar.svg', 'image/svg+xml', IMAGE_FILE_RULES).ok).toBe(false);
  });

  it('rejects HTML disguised as a PNG', () => {
    expect(validateFileContent(HTML, 'avatar.png', 'image/png', IMAGE_FILE_RULES).ok).toBe(false);
  });

  it('rejects an SVG renamed to .png with a spoofed image/png type', () => {
    expect(validateFileContent(SVG, 'avatar.png', 'image/png', IMAGE_FILE_RULES).ok).toBe(false);
  });
});

/**
 * Regression tests for path traversal through the uploaded filename.
 */
describe('Storage key construction', () => {
  it('never emits traversal segments from a hostile filename', () => {
    const ext = safeExtension('../../../../etc/passwd.pdf');
    const key = buildStorageKey('resumes', '../../admin', ext);
    expect(key).not.toContain('..');
    expect(key.startsWith('resumes/')).toBe(true);
    expect(key.split('/').length).toBe(3);
  });

  it('strips path separators out of the owner segment', () => {
    const key = buildStorageKey('avatars', 'a/b\\c', 'png');
    expect(key).toBe(key.replace(/\\/g, ''));
    expect(key.split('/').length).toBe(3);
  });

  it('produces an unpredictable, non-colliding key for the same inputs', () => {
    const a = buildStorageKey('resumes', 42, 'pdf');
    const b = buildStorageKey('resumes', 42, 'pdf');
    expect(a).not.toBe(b);
  });

  it('sanitises the extension', () => {
    expect(safeExtension('file.p df')).toBe('pdf');
    expect(safeExtension('../../x.PDF')).toBe('pdf');
    expect(safeExtension('noext')).toBe('');
  });
});

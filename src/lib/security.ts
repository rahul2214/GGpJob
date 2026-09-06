import { NextResponse } from 'next/server';

/**
 * Strips and escapes PostgREST special control characters to prevent filter injection
 * when constructing dynamic filter strings (e.g. in `.or(...)` or `.ilike(...)`).
 * Characters removed: comma, parentheses, colons, quotes, slashes, percent, and wildcards.
 */
export function sanitizePostgrestFilter(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  // Remove PostgREST operator injection tokens: ( ) , . : " ' % \
  return input.replace(/[\(\),\.:"'%\\;]/g, '').trim();
}

/**
 * Returns a standardized, safe error response.
 * In production mode, details are omitted to prevent leaking internal database schemas,
 * table structures, or system errors to potential attackers.
 */
export function safeErrorResponse(
  error: any,
  fallbackMessage = 'An unexpected error occurred.',
  status = 500
): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';
  const internalMessage = error?.message || String(error || fallbackMessage);

  // Always log server-side for debugging
  console.error(`[SECURITY_ERROR] Status ${status}:`, internalMessage);

  if (isProd) {
    return NextResponse.json(
      { error: fallbackMessage },
      { status }
    );
  }

  return NextResponse.json(
    {
      error: fallbackMessage,
      details: internalMessage,
    },
    { status }
  );
}

/**
 * Checks if a string contains known SQL injection or XSS patterns.
 */
export function containsSuspiciousPayload(input: string): boolean {
  if (!input || typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\bunion\b\s+all\b|\bunion\b\s+select\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\binsert\b\s+into\b)/i,
    /(\bdrop\b\s+(table|database|view)\b)/i,
    /(\bexec\b|\bexecute\b)\s*\(/i,
    /(\bwaitfor\b\s+delay\b)/i,
    /(\bbenchmark\b\s*\()/i,
    /(\binformation_schema\b)/i,
    /(\bor\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
    /--\s*$/,
    /\/\*.*?\*\//
  ];

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
    /javascript\s*:/i,
    /on(?:error|load|click|mouseover|submit)\s*=/i,
    /<iframe\b/i,
    /<img\b[^>]*onerror/i,
    /\beval\s*\(/i
  ];

  const traversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /\/etc\/passwd/i,
    /\bwin\.ini\b/i
  ];

  for (const pattern of [...sqlPatterns, ...xssPatterns, ...traversalPatterns]) {
    if (pattern.test(input)) {
      return true;
    }
  }

  return false;
}

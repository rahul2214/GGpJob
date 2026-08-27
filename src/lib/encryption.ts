import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const rawKey = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!rawKey && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: ENCRYPTION_KEY environment variable is required in production.');
}
// Derive a deterministic 32-byte buffer key
const ENCRYPTION_KEY_BUFFER = crypto.createHash('sha256').update(rawKey || 'jobsdart-dev-fallback-key-32bytes!').digest();
const IV_LENGTH = 16; // AES IV block size

/**
 * Encrypts a plain-text string using AES-256-CBC.
 * Returns the IV and encrypted text joined by a colon.
 */
export function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an encrypted string.
 * Falls back to returning the text as-is if decryption fails (backwards-compatible for legacy database data).
 */
export function decrypt(text: string): string {
    if (!text) return '';
    try {
        const textParts = text.split(':');
        if (textParts.length < 2) {
            // Not in "iv:encrypted" format, likely unencrypted legacy message
            return text;
        }
        const iv = Buffer.from(textParts.shift() || '', 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        console.error('[DECRYPTION_FAILED] Returning text as-is. Error:', err);
        return text;
    }
}

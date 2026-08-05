import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure the encryption key is exactly 32 bytes (256 bits)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; 
const IV_LENGTH = 16; // AES IV block size

/**
 * Encrypts a plain-text string using AES-256-CBC.
 * Returns the IV and encrypted text joined by a colon.
 */
export function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
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
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        console.error('[DECRYPTION_FAILED] Returning text as-is. Error:', err);
        return text;
    }
}

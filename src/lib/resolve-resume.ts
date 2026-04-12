import { getSignedResumeUrl } from "./r2";

/**
 * Resolves a resume URL from the database.
 * If it's an R2 URI (r2://...), it generates a signed HTTPS URL.
 * Otherwise (e.g. legacy Supabase URL), returns the original URL.
 * 
 * @param url The resume URL/URI from the database
 * @returns A publicly accessible HTTPS URL
 */
export async function resolveResumeUrl(url: string | null | undefined): Promise<string | null> {
    if (!url) return null;
    
    // If it's an R2 URI, sign it. 
    // The getSignedResumeUrl helper handles the prefix check and parsing.
    if (url.startsWith('r2://')) {
        return await getSignedResumeUrl(url);
    }
    
    // Return original if it's already an HTTPS link (Supabase fallback)
    return url;
}

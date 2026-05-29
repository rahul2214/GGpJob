
import { getSignedResumeUrl } from './src/lib/r2';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    const testUri = 'r2://test-bucket/test-file.pdf';
    console.log('Testing URI:', testUri);
    try {
        const url = await getSignedResumeUrl(testUri);
        console.log('Resolved URL:', url);
        if (url.startsWith('https://')) {
            console.log('SUCCESS: URL is valid HTTPS');
        } else {
            console.log('FAILED: URL did not resolve to HTTPS');
        }
    } catch (e) {
        console.error('ERROR during resolution:', e);
    }
}

test();

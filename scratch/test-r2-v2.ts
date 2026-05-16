
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';
dotenv.config();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim();
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
const R2_ENDPOINT = process.env.R2_ENDPOINT?.trim() || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);

const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

async function test() {
    const r2Uri = 'r2://jobsdart/proofs/6/proof-1777008684993.pdf';
    console.log('Testing URI:', r2Uri);
    console.log('Endpoint:', R2_ENDPOINT);
    
    try {
        const parts = r2Uri.replace("r2://", "").split("/");
        const bucket = parts.shift();
        const key = parts.join("/");

        console.log('Bucket:', bucket);
        console.log('Key:', key);

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        console.log('Generated URL:', url);
        
        if (url.startsWith('https://')) {
            console.log('SUCCESS: URL generated.');
        } else {
            console.log('FAILED: URL is not HTTPS.');
        }
    } catch (e) {
        console.error('ERROR:', e);
    }
}

test();

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT || (R2_ACCOUNT_ID ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);

// Single client instance
const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});


/**
 * Deletes an object from Cloudflare R2
 * @param r2Uri format: r2://bucket-name/path/to/file.pdf
 */
export async function deleteFromR2(r2Uri: string) {
  if (!r2Uri || !r2Uri.startsWith("r2://")) return;

  try {
    const parts = r2Uri.replace("r2://", "").split("/");
    const bucket = parts.shift();
    const key = parts.join("/");

    if (!bucket || !key) return;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await r2Client.send(command);
    console.log(`[R2_DELETE_SUCCESS]: ${r2Uri}`);
  } catch (error) {
    console.error("[R2_DELETE_ERROR]:", error);
  }
}

/**
 * Generates a presigned URL for uploading a file directly from the frontend.
 * @param key The destination path in R2
 * @param contentType The MIME type of the file (e.g. application/pdf)
 */
export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600) {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not configured");

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(r2Client, command, { expiresIn });
  return {
    url,
    r2Uri: `r2://${R2_BUCKET_NAME}/${key}`
  };
}

/**
 * Uploads a file buffer directly to Cloudflare R2 from the server.
 */
export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string) {
  if (!R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is not configured");

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return {
    r2Uri: `r2://${R2_BUCKET_NAME}/${key}`
  };
}

/**
 * Generates a presigned URL for an internal R2 URI
 * r2Uri format: r2://bucket-name/path/to/file.pdf
 */
export async function getSignedResumeUrl(r2Uri: string, expiresIn = 3600) {
  if (!r2Uri || !r2Uri.startsWith("r2://")) return r2Uri;

  try {
    const parts = r2Uri.replace("r2://", "").split("/");
    const bucket = parts.shift();
    const key = parts.join("/");

    if (!bucket || !key) return r2Uri;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error("[R2_SIGNED_URL_ERROR]:", error);
    return r2Uri; // Fallback to original
  }
}

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getClient(): S3Client | null {
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_S3_BUCKET ||
    !process.env.AWS_REGION
  ) {
    return null;
  }
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export function isS3Configured(): boolean {
  return getClient() !== null;
}

export async function generatePresignedPutUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string } | null> {
  const client = getClient();
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!client || !bucket || !region) return null;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return { uploadUrl, publicUrl };
}

export async function deleteS3Object(key: string): Promise<void> {
  const client = getClient();
  const bucket = process.env.AWS_S3_BUCKET;
  if (!client || !bucket) return;

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export function parseS3KeyFromPublicUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    if (!bucket || !region) return null;
    if (host === `${bucket}.s3.${region}.amazonaws.com`) {
      return u.pathname.replace(/^\//, "");
    }
    if (host === `${bucket}.s3.amazonaws.com`) {
      return u.pathname.replace(/^\//, "");
    }
    return null;
  } catch {
    return null;
  }
}

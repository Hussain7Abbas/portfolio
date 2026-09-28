import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type StorageConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  location: string;
};

/** Hetzner Object Storage config; locations are e.g. `fsn1`, `nbg1`, `hel1`. */
function getConfig(): StorageConfig | null {
  const accessKeyId = process.env.HETZNER_S3_ACCESS_KEY;
  const secretAccessKey = process.env.HETZNER_S3_SECRET_KEY;
  const bucket = process.env.HETZNER_S3_BUCKET;
  const location = process.env.HETZNER_S3_LOCATION;
  if (!accessKeyId || !secretAccessKey || !bucket || !location) {
    return null;
  }
  return { accessKeyId, secretAccessKey, bucket, location };
}

function publicHost(config: StorageConfig): string {
  return `${config.bucket}.${config.location}.your-objectstorage.com`;
}

function getClient(config: StorageConfig): S3Client {
  return new S3Client({
    region: config.location,
    endpoint: `https://${config.location}.your-objectstorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Hetzner does not support the default CRC32 checksums newer AWS SDKs add to every request.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export function isS3Configured(): boolean {
  return getConfig() !== null;
}

export async function generatePresignedPutUrl(
  key: string,
  contentType: string,
): Promise<{ uploadUrl: string; publicUrl: string } | null> {
  const config = getConfig();
  if (!config) return null;

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getClient(config), command, { expiresIn: 3600 });
  const publicUrl = `https://${publicHost(config)}/${key}`;
  return { uploadUrl, publicUrl };
}

export async function deleteS3Object(key: string): Promise<void> {
  const config = getConfig();
  if (!config) return;

  await getClient(config).send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}

export function parseS3KeyFromPublicUrl(url: string): string | null {
  const config = getConfig();
  if (!config) return null;
  try {
    const u = new URL(url);
    if (u.hostname !== publicHost(config)) return null;
    return u.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

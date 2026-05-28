import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export type UploadResult = {
  url: string;
  key: string;
};

export async function uploadFile(buffer: Buffer, mimeType: string): Promise<UploadResult> {
  const provider = process.env.STORAGE_PROVIDER ?? 'local';

  if (provider === 's3') {
    return uploadToS3(buffer, mimeType);
  }
  return uploadToLocal(buffer, mimeType);
}

export async function deleteFile(key: string): Promise<void> {
  const provider = process.env.STORAGE_PROVIDER ?? 'local';

  if (provider === 's3') {
    await deleteFromS3(key);
  } else {
    await deleteFromLocal(key);
  }
}

// ── Local storage (development) ──────────────────────────────────────────────

async function uploadToLocal(buffer: Buffer, mimeType: string): Promise<UploadResult> {
  const ext = mimeTypeToExt(mimeType);
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return { url: `/uploads/${filename}`, key: filename };
}

async function deleteFromLocal(key: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', 'uploads', key);
  await fs.unlink(filePath).catch(() => {});
}

// ── S3 storage (production) ───────────────────────────────────────────────────
// Requires: npm install @aws-sdk/client-s3
// Env: AWS_REGION, AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

async function uploadToS3(buffer: Buffer, mimeType: string): Promise<UploadResult> {
  const bucket = process.env.AWS_S3_BUCKET_NAME!;
  const region = process.env.AWS_REGION ?? 'ap-northeast-1';
  const ext = mimeTypeToExt(mimeType);
  const key = `photos/${randomUUID()}${ext}`;

  // @aws-sdk/client-s3 は本番切り替え時に npm install して使う
  const modName = '@aws-sdk/client-s3';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s3Mod = (await import(/* webpackIgnore: true */ modName)) as any;
  const client = new s3Mod.S3Client({ region });
  await client.send(new s3Mod.PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  return {
    url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    key,
  };
}

async function deleteFromS3(key: string): Promise<void> {
  const bucket = process.env.AWS_S3_BUCKET_NAME!;
  const region = process.env.AWS_REGION ?? 'ap-northeast-1';

  const modName = '@aws-sdk/client-s3';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const s3Mod = (await import(/* webpackIgnore: true */ modName)) as any;
  const client = new s3Mod.S3Client({ region });
  await client.send(new s3Mod.DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mimeTypeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimeType] ?? '.jpg';
}

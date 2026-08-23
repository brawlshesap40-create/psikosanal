import "server-only";
import { randomUUID } from "crypto";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3, S3_BUCKET, S3_PUBLIC_URL } from "./client";

let bucketReady: Promise<void> | null = null;

async function createBucketWithPublicRead() {
  await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
  // Uploaded files are served directly from S3_PUBLIC_URL (no presigning), so
  // a freshly created bucket needs an explicit public-read policy. This is a
  // no-op failure on providers that manage bucket policy separately (e.g. a
  // locked-down production AWS bucket behind CloudFront).
  await s3
    .send(
      new PutBucketPolicyCommand({
        Bucket: S3_BUCKET,
        Policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: "s3:GetObject",
              Resource: `arn:aws:s3:::${S3_BUCKET}/*`,
            },
          ],
        }),
      })
    )
    .catch(() => undefined);
}

function ensureBucket() {
  if (!bucketReady) {
    bucketReady = s3
      .send(new HeadBucketCommand({ Bucket: S3_BUCKET }))
      .catch(() => createBucketWithPublicRead())
      .then(() => undefined)
      .catch(() => {
        bucketReady = null;
        throw new Error(`"${S3_BUCKET}" depolama alanı oluşturulamadı.`);
      });
  }
  return bucketReady;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  ...ALLOWED_IMAGE_TYPES,
]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

export async function uploadImage(file: File, folder: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Sadece JPEG, PNG, WEBP veya AVIF gorsel yuklenebilir");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Görsel boyutu 5 MB'ı geçemez");
  }
  return uploadFile(file, folder);
}

export async function uploadDocument(file: File, folder: string) {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    throw new Error("Sadece PDF veya gorsel dosya yuklenebilir");
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("Dosya boyutu 10 MB'ı geçemez");
  }
  return uploadFile(file, folder);
}

async function uploadFile(file: File, folder: string) {
  await ensureBucket();

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() ?? "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );
  } catch {
    throw new Error("Dosya yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.");
  }

  return { url: `${S3_PUBLIC_URL}/${key}`, key };
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

export function keyFromUrl(url: string) {
  if (!url.startsWith(S3_PUBLIC_URL)) return null;
  return url.slice(S3_PUBLIC_URL.length + 1);
}

import "server-only";
import { randomUUID } from "crypto";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, S3_PUBLIC_URL } from "./client";

const PUBLIC_PREFIX = "public";
const PRIVATE_PREFIX = "private";
const DOCUMENT_URL_EXPIRY_SECONDS = 300;

let bucketReady: Promise<void> | null = null;

// Only the "public/" prefix is world-readable (profile photos). Documents
// live under "private/" and are only ever served via short-lived signed
// URLs (see getDocumentViewUrl). Applied unconditionally — not just on first
// creation — so a bucket provisioned before this policy existed (or by an
// external process) still gets corrected. No-op failure on providers that
// manage bucket policy separately (e.g. a locked-down production bucket).
async function applyPublicPrefixPolicy() {
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
              Resource: `arn:aws:s3:::${S3_BUCKET}/${PUBLIC_PREFIX}/*`,
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
      .catch(() => s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET })))
      .then(() => applyPublicPrefixPolicy())
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

/** Publicly viewable (e.g. profile photos). Returns a permanent public URL. */
export async function uploadImage(file: File, folder: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Sadece JPEG, PNG, WEBP veya AVIF gorsel yuklenebilir");
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Görsel boyutu 5 MB'ı geçemez");
  }
  const key = await putFile(file, `${PUBLIC_PREFIX}/${folder}`);
  return { url: `${S3_PUBLIC_URL}/${key}`, key };
}

/**
 * Private (e.g. license/diploma documents). Never publicly readable — callers
 * must persist the returned `key` and generate a signed URL via
 * getDocumentViewUrl() for authorized viewers only.
 */
export async function uploadDocument(file: File, folder: string) {
  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    throw new Error("Sadece PDF veya gorsel dosya yuklenebilir");
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("Dosya boyutu 10 MB'ı geçemez");
  }
  const key = await putFile(file, `${PRIVATE_PREFIX}/${folder}`);
  return { key };
}

export async function getDocumentViewUrl(key: string) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }), {
    expiresIn: DOCUMENT_URL_EXPIRY_SECONDS,
  });
}

async function putFile(file: File, folderPath: string) {
  await ensureBucket();

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() ?? "bin";
  const key = `${folderPath}/${randomUUID()}.${ext}`;

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

  return key;
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
}

export function keyFromUrl(url: string) {
  if (!url.startsWith(S3_PUBLIC_URL)) return null;
  return url.slice(S3_PUBLIC_URL.length + 1);
}

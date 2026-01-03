import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: config.r2.endpoint,
  credentials: {
    accessKeyId: config.r2.accessKeyId || '',
    secretAccessKey: config.r2.secretAccessKey || '',
  },
});

// Allowed image types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Image folders
type ImageFolder = 'restaurants' | 'menu-items' | 'avatars';

// Generate unique filename
function generateFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${uniqueId}${ext}`;
}

// Validate file
export function validateFile(
  file: Express.Multer.File
): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

// Upload file to R2
export async function uploadFile(
  file: Express.Multer.File,
  folder: ImageFolder
): Promise<{ url: string; key: string }> {
  const fileName = generateFileName(file.originalname);
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  });

  await s3Client.send(command);

  const url = `${config.r2.publicUrl}/${key}`;

  return { url, key };
}

// Delete file from R2
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Failed to delete file from R2:', error);
    return false;
  }
}

// Extract key from full URL
export function extractKeyFromUrl(url: string): string | null {
  if (!config.r2.publicUrl || !url.startsWith(config.r2.publicUrl)) {
    return null;
  }

  return url.replace(`${config.r2.publicUrl}/`, '');
}

// Upload and replace (deletes old file if exists)
export async function uploadAndReplace(
  file: Express.Multer.File,
  folder: ImageFolder,
  oldUrl?: string | null
): Promise<{ url: string; key: string }> {
  // Upload new file first
  const result = await uploadFile(file, folder);

  // Delete old file if exists (don't wait, fire and forget)
  if (oldUrl) {
    const oldKey = extractKeyFromUrl(oldUrl);
    if (oldKey) {
      deleteFile(oldKey).catch(() => {});
    }
  }

  return result;
}

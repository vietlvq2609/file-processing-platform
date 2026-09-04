import { Client } from 'minio';

import { config } from './config.js';

export const minioClient = new Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(config.minio.bucket);
  if (!exists) {
    await minioClient.makeBucket(config.minio.bucket);
  }
}

/**
 * Rewrites the scheme/host/port of a MinIO-generated URL to the browser-facing
 * public endpoint. The SDK client is configured with the internal Docker
 * hostname, so URLs it generates (e.g. presigned POST policies) are only
 * reachable from other containers — never from the browser — until rewritten.
 */
export function toPublicStorageUrl(internalUrl: string): string {
  const target = new URL(internalUrl);
  const publicBase = new URL(config.minio.publicUrl);
  target.protocol = publicBase.protocol;
  target.hostname = publicBase.hostname;
  target.port = publicBase.port;
  return target.toString();
}

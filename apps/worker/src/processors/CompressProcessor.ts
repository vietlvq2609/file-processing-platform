import type { Readable } from 'node:stream';

import type { IFileRepository, IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';
import sharp from 'sharp';

import { config } from '../config.js';
import { minioClient } from '../storage.js';
import type { IProcessor } from './IProcessor.js';

async function publish(redis: Redis, channel: string, data: object): Promise<void> {
  await redis.publish(channel, JSON.stringify(data));
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export class CompressProcessor implements IProcessor {
  async process(
    bullJob: BullJob<JobPayload>,
    jobRepo: IJobRepository,
    fileRepo: IFileRepository,
    redis: Redis
  ): Promise<void> {
    const { jobId, fileId, userId, options } = bullJob.data;
    const quality = options?.quality ?? 80;

    await jobRepo.updateStatus(jobId, 'active', { progress: 0 });
    await publish(redis, `job:progress:${jobId}`, { progress: 0, status: 'active' });

    const inputFile = await fileRepo.findById(userId, fileId);
    if (!inputFile) {
      throw new Error(`Input file not found: ${fileId}`);
    }

    const objectStream = await minioClient.getObject(config.minio.bucket, inputFile.storagePath);
    const inputBuffer = await streamToBuffer(objectStream);

    await Promise.all([
      bullJob.updateProgress(33),
      jobRepo.updateProgress(jobId, 33),
      publish(redis, `job:progress:${jobId}`, { progress: 33, status: 'active' }),
    ]);

    let outputBuffer: Buffer;
    if (inputFile.mimeType === 'image/png') {
      outputBuffer = await sharp(inputBuffer).png({ quality }).toBuffer();
    } else if (inputFile.mimeType === 'image/webp') {
      outputBuffer = await sharp(inputBuffer).webp({ quality }).toBuffer();
    } else {
      outputBuffer = await sharp(inputBuffer).jpeg({ quality }).toBuffer();
    }

    await Promise.all([
      bullJob.updateProgress(66),
      jobRepo.updateProgress(jobId, 66),
      publish(redis, `job:progress:${jobId}`, { progress: 66, status: 'active' }),
    ]);

    const outputStoragePath = `processed/${userId}/${jobId}/${inputFile.originalName}`;
    await minioClient.putObject(
      config.minio.bucket,
      outputStoragePath,
      outputBuffer,
      outputBuffer.length,
      { 'Content-Type': inputFile.mimeType }
    );

    const outputFile = await fileRepo.create({
      userId,
      originalName: inputFile.originalName,
      mimeType: inputFile.mimeType,
      size: outputBuffer.length,
      storagePath: outputStoragePath,
      status: 'ready',
    });

    await jobRepo.updateStatus(jobId, 'completed', {
      progress: 100,
      outputFileId: outputFile.id,
    });
    await publish(redis, `job:completed:${jobId}`, { outputFileId: outputFile.id });
  }
}

export const compressProcessor = new CompressProcessor();

import path from 'node:path';
import type { Readable } from 'node:stream';

import type { IFileRepository, IJobRepository } from '@fpp/db';
import type { JobPayload } from '@fpp/types';
import type { Job as BullJob } from 'bullmq';
import type { Redis } from 'ioredis';
import sharp from 'sharp';

import { config } from '../config.js';
import { minioClient } from '../storage.js';
import type { IProcessor } from './IProcessor.js';

const FORMAT_CONFIG = {
  jpeg: { ext: 'jpg', mime: 'image/jpeg' },
  png: { ext: 'png', mime: 'image/png' },
  webp: { ext: 'webp', mime: 'image/webp' },
} as const;

type ConvertFormat = keyof typeof FORMAT_CONFIG;

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

export class ConvertProcessor implements IProcessor {
  async process(
    bullJob: BullJob<JobPayload>,
    jobRepo: IJobRepository,
    fileRepo: IFileRepository,
    redis: Redis
  ): Promise<void> {
    const { jobId, fileId, userId, type } = bullJob.data;
    const format = type as ConvertFormat;
    const { ext, mime } = FORMAT_CONFIG[format];

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
    if (format === 'png') {
      outputBuffer = await sharp(inputBuffer).png().toBuffer();
    } else if (format === 'webp') {
      outputBuffer = await sharp(inputBuffer).webp().toBuffer();
    } else {
      outputBuffer = await sharp(inputBuffer).jpeg().toBuffer();
    }

    await Promise.all([
      bullJob.updateProgress(66),
      jobRepo.updateProgress(jobId, 66),
      publish(redis, `job:progress:${jobId}`, { progress: 66, status: 'active' }),
    ]);

    const stem = path.basename(inputFile.originalName, path.extname(inputFile.originalName));
    const outputName = `${stem}.${ext}`;
    const outputStoragePath = `processed/${userId}/${jobId}/${outputName}`;

    await minioClient.putObject(
      config.minio.bucket,
      outputStoragePath,
      outputBuffer,
      outputBuffer.length,
      { 'Content-Type': mime }
    );

    const outputFile = await fileRepo.create({
      userId,
      originalName: outputName,
      mimeType: mime,
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

export const convertProcessor = new ConvertProcessor();

import { createWorker } from 'tesseract.js';
import { db } from '../db.js';
import { readImage } from './images.js';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const queue: string[] = [];
let running = false;
export function enqueueOcr(id: string) {
  if (!queue.includes(id)) queue.push(id);
  void drain();
}
async function drain() {
  if (running) return;
  running = true;
  try {
    while (queue.length) {
      const id = queue.shift()!;
      const receipt = await db.receipt.findUnique({ where: { id }, include: { job: true } });
      if (!receipt || receipt.status !== 'processing' || !receipt.imagePath || !receipt.job) continue;
      let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
      try {
        await db.ocrJob.update({ where: { receiptId: id }, data: { status: 'running', startedAt: new Date(), attemptCount: { increment: 1 }, safeErrorCode: null } });
        const cachePath = resolve('storage/ocr-cache');
        await mkdir(cachePath, { recursive: true });
        worker = await createWorker('eng', 1, { cachePath, logger: () => {}, errorHandler: () => {} });
        const image = await readImage(receipt.imagePath);
        const recognition = worker.recognize(image);
        let timeout: ReturnType<typeof setTimeout>;
        const result = await Promise.race([recognition, new Promise<never>((_, reject) => { timeout = setTimeout(() => reject(new Error('timeout')), 90_000); })]).finally(() => clearTimeout(timeout));
        await db.$transaction(async tx => {
          const changed = await tx.receipt.updateMany({ where: { id, status: 'processing' }, data: { status: 'needs_review', suggestions: JSON.stringify({ rawText: result.data.text.slice(0, 30_000), confidence: result.data.confidence, warnings: ['OCR suggestions must be reviewed before confirmation.'] }) } });
          if (changed.count) await tx.ocrJob.update({ where: { receiptId: id }, data: { status: 'finished', finishedAt: new Date() } });
        });
      } catch {
        await db.receipt.updateMany({ where: { id, status: 'processing' }, data: { status: 'failed' } });
        await db.ocrJob.updateMany({ where: { receiptId: id }, data: { status: 'failed', finishedAt: new Date(), safeErrorCode: 'OCR_FAILED' } });
      } finally { await worker?.terminate().catch(() => {}); }
    }
  } finally { running = false; }
}
export async function recoverInterruptedOcr() {
  const interrupted = await db.receipt.findMany({ where: { status: 'processing' }, select: { id: true } });
  await db.$transaction([
    db.receipt.updateMany({ where: { status: 'processing' }, data: { status: 'failed' } }),
    db.ocrJob.updateMany({ where: { receiptId: { in: interrupted.map(r => r.id) } }, data: { status: 'failed', safeErrorCode: 'OCR_INTERRUPTED', finishedAt: new Date() } }),
  ]);
}

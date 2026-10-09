import { Router } from 'express';
import multer from 'multer';
import { rateLimit } from 'express-rate-limit';
import { db } from '../db.js';
import { requireUser, ownerWhere } from '../middleware/owner.js';
import { HttpError } from '../errors.js';
import { storeImage, readImage, deleteImage, MAX_BYTES } from '../services/images.js';
import { enqueueOcr } from '../services/ocr.js';
import { reviewSchema } from '../domain/money.js';
import { saveReview, confirmReceipt } from '../services/review.js';
import { duplicateWarnings } from '../services/duplicates.js';
export const receipts = Router();
receipts.use(requireUser);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: 1, fields: 0 } });
const uploadLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { code: 'RATE_LIMITED', message: 'Upload limit reached. Try again later.' } });
export async function ownedReceipt(userId: string, id: string) {
  const receipt = await db.receipt.findFirst({ where: ownerWhere(userId, id), include: { lines: true, job: true } });
  if (!receipt) throw new HttpError(404, 'NOT_FOUND', 'Receipt not found.');
  return receipt;
}
export function publicReceipt(receipt: Awaited<ReturnType<typeof ownedReceipt>>) {
  const { imagePath, fileSha256: _hash, ...safe } = receipt;
  void _hash;
  return { ...safe, hasImage: !!imagePath, suggestions: JSON.parse(receipt.suggestions) };
}
receipts.post('/manual', async (req, res) => {
  const input = reviewSchema.parse(req.body);
  const receipt = await db.receipt.create({ data: { userId: req.userId } });
  try { await saveReview(req.userId, receipt.id, input); }
  catch (err) { await db.receipt.delete({ where: { id: receipt.id } }); throw err; }
  res.status(201).json(publicReceipt(await ownedReceipt(req.userId, receipt.id)));
});
receipts.post('/upload', uploadLimit, (req, res, next) => upload.single('image')(req, res, error => {
  if (error) return next(new HttpError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, 'UPLOAD_REJECTED', 'Upload one JPG, PNG or WebP image, at most 8 MB.'));
  next();
}), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'MISSING_IMAGE', 'Choose an image.');
  const stored = await storeImage(req.file.buffer, req.file.mimetype);
  try {
    const receipt = await db.receipt.create({ data: { userId: req.userId, ...stored, status: 'processing', job: { create: {} } } });
    if (process.env.NODE_ENV !== 'test') enqueueOcr(receipt.id);
    res.status(202).json({ id: receipt.id, status: receipt.status });
  } catch (err) { await deleteImage(stored.imagePath); throw err; }
});
receipts.get('/:id', async (req, res) => res.json({ ...publicReceipt(await ownedReceipt(req.userId, String(req.params.id))), duplicates: await duplicateWarnings(req.userId, String(req.params.id)) }));
receipts.get('/:id/ocr-status', async (req, res) => {
  const receipt = await ownedReceipt(req.userId, String(req.params.id));
  res.json({ status: receipt.status, job: receipt.job });
});
receipts.get('/:id/image', async (req, res) => {
  const receipt = await ownedReceipt(req.userId, String(req.params.id));
  if (!receipt.imagePath) throw new HttpError(404, 'NOT_FOUND', 'Original image is no longer retained.');
  res.set('Cache-Control', 'private, no-store').type('png').send(await readImage(receipt.imagePath));
});
receipts.patch('/:id/review', async (req, res) => {
  await saveReview(req.userId, String(req.params.id), reviewSchema.parse(req.body));
  res.json(publicReceipt(await ownedReceipt(req.userId, String(req.params.id))));
});
receipts.post('/:id/confirm', async (req, res) => {
  const pending = await ownedReceipt(req.userId, String(req.params.id));
  if (pending.status !== 'confirmed' && (await duplicateWarnings(req.userId, String(req.params.id))).length && req.body?.duplicateAcknowledged !== true) throw new HttpError(409, 'POTENTIAL_DUPLICATE', 'Potential duplicate found. Review the source receipt and explicitly acknowledge before confirming a distinct purchase.');
  const receipt = await confirmReceipt(req.userId, String(req.params.id));
  const user = await db.user.findUniqueOrThrow({ where: { id: req.userId } });
  if (!user.retainImages && receipt.imagePath) {
    await deleteImage(receipt.imagePath);
    await db.receipt.update({ where: { id: receipt.id }, data: { imagePath: null, suggestions: '{}' } });
  }
  res.json(publicReceipt(await ownedReceipt(req.userId, String(req.params.id))));
});
receipts.post('/:id/retry-ocr', uploadLimit, async (req, res) => {
  const receipt = await ownedReceipt(req.userId, String(req.params.id));
  if (receipt.status !== 'failed' || !receipt.imagePath || !receipt.job || receipt.job.attemptCount >= 3) throw new HttpError(409, 'RETRY_UNAVAILABLE', 'Retry is unavailable. Use manual correction instead.');
  await db.$transaction([db.receipt.update({ where: { id: receipt.id }, data: { status: 'processing' } }), db.ocrJob.update({ where: { receiptId: receipt.id }, data: { status: 'queued', safeErrorCode: null } })]);
  if (process.env.NODE_ENV !== 'test') enqueueOcr(receipt.id);
  res.status(202).json({ status: 'processing' });
});
receipts.delete('/:id', async (req, res) => {
  const receipt = await ownedReceipt(req.userId, String(req.params.id));
  await deleteImage(receipt.imagePath);
  await db.receipt.delete({ where: { id: receipt.id } });
  res.status(204).end();
});


import { db } from '../db.js';
import { HttpError } from '../errors.js';
import { assertTransition } from '../domain/status.js';
import { reviewSchema, validateTotals, type ReviewInput } from '../domain/money.js';
export async function saveReview(userId: string, id: string, input: ReviewInput) {
  validateTotals(input);
  return db.$transaction(async tx => {
    const receipt = await tx.receipt.findFirst({ where: { id, userId } });
    if (!receipt) throw new HttpError(404, 'NOT_FOUND', 'Receipt not found.');
    if (!['needs_review', 'failed'].includes(receipt.status)) throw new HttpError(409, 'INVALID_STATE', 'Only pending or failed receipts can be reviewed.');
    await tx.receiptLine.deleteMany({ where: { receiptId: id } });
    const saved = await tx.receipt.update({ where: { id }, data: { rawMerchant: input.merchant, purchaseDate: input.purchaseDate, subtotalCents: input.subtotalCents, taxCents: input.taxCents, totalCents: input.totalCents, correctionNote: input.correctionNote, status: 'needs_review', lines: { create: input.lines.map(({ productId: _productId, ...line }) => { void _productId; return { ...line, reviewedByUser: true }; }) } } });
    return saved;
  });
}
export async function confirmReceipt(userId: string, id: string) {
  return db.$transaction(async tx => {
    const receipt = await tx.receipt.findFirst({ where: { id, userId }, include: { lines: true } });
    if (!receipt) throw new HttpError(404, 'NOT_FOUND', 'Receipt not found.');
    if (receipt.status === 'confirmed') return receipt;
    assertTransition(receipt.status, 'confirmed');
    if (!receipt.lines.length || receipt.lines.some(line => !line.reviewedByUser)) throw new HttpError(422, 'REVIEW_REQUIRED', 'Save reviewed lines before confirming.');
    validateTotals(reviewSchema.parse({ merchant: receipt.rawMerchant, purchaseDate: receipt.purchaseDate, subtotalCents: receipt.subtotalCents, taxCents: receipt.taxCents, totalCents: receipt.totalCents, correctionNote: receipt.correctionNote, lines: receipt.lines }));
    await tx.receipt.updateMany({ where: { id, userId, status: 'needs_review' }, data: { status: 'confirmed', confirmedAt: new Date() } });
    return tx.receipt.findUniqueOrThrow({ where: { id } });
  });
}

import { db } from '../db.js';
import { HttpError } from '../errors.js';
import { assertTransition } from '../domain/status.js';
import { reviewSchema, validateTotals, type ReviewInput } from '../domain/money.js';
import { normalizeQuantity } from '../domain/units.js';
export async function saveReview(userId: string, id: string, input: ReviewInput) {
  validateTotals(input);
  return db.$transaction(async tx => {
    const receipt = await tx.receipt.findFirst({ where: { id, userId } });
    if (!receipt) throw new HttpError(404, 'NOT_FOUND', 'Receipt not found.');
    if (!['needs_review', 'failed'].includes(receipt.status)) throw new HttpError(409, 'INVALID_STATE', 'Only pending or failed receipts can be reviewed.');
    for (const line of input.lines) if (line.productId && !await tx.canonicalProduct.findFirst({where:{id:line.productId,userId}})) throw new HttpError(404,'NOT_FOUND','Product not found.');
    await tx.receiptLine.deleteMany({ where: { receiptId: id } });
    const saved = await tx.receipt.update({ where: { id }, data: { rawMerchant: input.merchant, purchaseDate: input.purchaseDate, subtotalCents: input.subtotalCents, taxCents: input.taxCents, totalCents: input.totalCents, correctionNote: input.correctionNote, status: 'needs_review', lines: { create: input.lines.map(line => ({ ...line, reviewedByUser: true })) } } });
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
    for (const line of receipt.lines) if (line.productId) {
      const product = await tx.canonicalProduct.findFirst({where:{id:line.productId,userId}});
      if (!product) throw new HttpError(404,'NOT_FOUND','Product not found.');
      const normalized = normalizeQuantity(line.quantityDecimal,line.quantityUnit,line.packageSizeDecimal,line.packageUnit);
      if (normalized.family !== product.unitFamily) throw new HttpError(422,'INCOMPATIBLE_PRODUCT','Mapped product measurement family does not match the reviewed quantity.');
      await tx.priceObservation.create({data:{userId,receiptId:id,lineId:line.id,productId:product.id,purchaseDate:receipt.purchaseDate,merchant:receipt.rawMerchant,normalizedQuantityDecimal:normalized.quantity,normalizedUnit:normalized.unit,lineTotalCents:line.lineTotalCents}});
    }
    return tx.receipt.findUniqueOrThrow({ where: { id } });
  });
}

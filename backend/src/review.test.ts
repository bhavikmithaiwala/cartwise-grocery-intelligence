import { afterAll, expect, test } from 'vitest';
import { db } from './db.js';
import { saveReview, confirmReceipt } from './services/review.js';
afterAll(() => db.$disconnect());
export const syntheticReview = { merchant: 'Fictional Market', purchaseDate: '2026-10-01', subtotalCents: 750, taxCents: 0, totalCents: 750, correctionNote: '', lines: [{ rawText: 'MILK 4.50', description: 'Milk', category: 'Dairy' as const, quantityDecimal: '1', quantityUnit: 'each' as const, lineTotalCents: 450 }, { rawText: '', description: 'Apples', category: 'Produce' as const, quantityDecimal: '1', quantityUnit: 'kg' as const, lineTotalCents: 300 }] };
test('confirmation requires saved human review and is idempotent', async () => {
  const user = await db.user.create({ data: { email: `review-${Date.now()}@example.test`, passwordHash: 'fixture' } });
  try {
    const receipt = await db.receipt.create({ data: { userId: user.id } });
    await expect(confirmReceipt(user.id, receipt.id)).rejects.toThrow('reviewed');
    await saveReview(user.id, receipt.id, syntheticReview);
    const product = await db.canonicalProduct.create({data:{userId:user.id,name:'Fictional Milk',unitFamily:'volume'}});
    await saveReview(user.id, receipt.id, {...syntheticReview,lines:syntheticReview.lines.map((line,index)=>index===0?{...line,productId:product.id,packageSizeDecimal:'1',packageUnit:'l' as const}:line)});
    await confirmReceipt(user.id, receipt.id);
    await Promise.all([confirmReceipt(user.id, receipt.id),confirmReceipt(user.id, receipt.id)]);
    expect(await db.receipt.count({ where: { userId: user.id, status: 'confirmed' } })).toBe(1);
    expect(await db.receiptLine.count({ where: { receiptId: receipt.id } })).toBe(2);
    expect(await db.priceObservation.count({where:{receiptId:receipt.id}})).toBe(1);
    expect((await db.priceObservation.findFirstOrThrow({where:{receiptId:receipt.id}})).normalizedQuantityDecimal).toBe('1000');
    await expect(saveReview(user.id, receipt.id, syntheticReview)).rejects.toThrow();
  } finally { await db.user.delete({ where: { id: user.id } }); }
});

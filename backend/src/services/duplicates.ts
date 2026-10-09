import { db } from '../db.js';
export async function duplicateWarnings(userId: string, id: string) {
  const receipt = await db.receipt.findFirst({ where: { id, userId } });
  if (!receipt) return [];
  const others = await db.receipt.findMany({ where: { userId, id: { not: id }, status: { not: 'discarded' }, OR: [ ...(receipt.fileSha256 ? [{ fileSha256: receipt.fileSha256 }] : []), ...(receipt.purchaseDate && receipt.rawMerchant ? [{ purchaseDate: receipt.purchaseDate, totalCents: receipt.totalCents }] : []) ] }, select: { id: true, rawMerchant: true, purchaseDate: true, totalCents: true, fileSha256: true, status: true }, take: 20 });
  return others.filter(other => other.fileSha256 === receipt.fileSha256 && !!receipt.fileSha256 || other.rawMerchant.trim().toLowerCase() === receipt.rawMerchant.trim().toLowerCase()).map(other => ({ id: other.id, merchant: other.rawMerchant, purchaseDate: other.purchaseDate, status: other.status, reason: other.fileSha256 === receipt.fileSha256 && !!receipt.fileSha256 ? 'exact_file' : 'same_merchant_date_total' }));
}

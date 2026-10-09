import { z } from 'zod';
import { HttpError } from '../errors.js';
export const centsSchema = z.number().int().min(0).max(999_999_999);
export const decimalSchema = z.string().regex(/^\d{1,7}(?:\.\d{1,6})?$/).refine(s => /^\d{1,7}(?:\.\d{1,6})?$/.test(s) && BigInt(s.replace('.', '')) > 0, 'Quantity must be positive');
export function parseMoney(text: string) {
  const match = /^\$?(\d{1,7})\.(\d{2})$/.exec(text.trim());
  if (!match) throw new HttpError(400, 'INVALID_MONEY', 'Money must have exactly two decimal places.');
  return centsSchema.parse(Number(match[1]) * 100 + Number(match[2]));
}
export const dateSchema = z.string().regex(/^20\d{2}-\d{2}-\d{2}$/).refine(s => {
  const date = new Date(`${s}T12:00:00Z`); return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === s;
}, 'Invalid calendar date');
export const units = z.enum(['each','g','kg','ml','l']);
export const categories = ['Produce','Dairy','Meat','Pantry','Bakery','Frozen','Household','Other'] as const;
export const lineSchema = z.object({ rawText: z.string().max(500).default(''), description: z.string().trim().min(1).max(120), category: z.enum(categories), quantityDecimal: decimalSchema, quantityUnit: units, packageSizeDecimal: decimalSchema.nullish().transform(v => v ?? undefined), packageUnit: units.nullish().transform(v => v ?? undefined), lineTotalCents: centsSchema, parserConfidence: z.number().min(0).max(1).nullish().transform(v => v ?? undefined), productId: z.string().max(50).nullish().transform(v => v || undefined) });
export const reviewSchema = z.object({ merchant: z.string().trim().min(1).max(120), purchaseDate: dateSchema, subtotalCents: centsSchema, taxCents: centsSchema, totalCents: centsSchema, lines: z.array(lineSchema).min(1).max(100), correctionNote: z.string().trim().max(500).default(''), duplicateAcknowledged: z.boolean().optional() }).strict();
export type ReviewInput = z.infer<typeof reviewSchema>;
export function validateTotals(input: ReviewInput) {
  const sum = input.lines.reduce((total, line) => total + line.lineTotalCents, 0);
  if (sum > 999_999_999 || input.subtotalCents + input.taxCents > 999_999_999) throw new HttpError(422, 'AMOUNT_OVERFLOW', 'Receipt amounts are too large.');
  if ((sum !== input.subtotalCents || input.subtotalCents + input.taxCents !== input.totalCents) && input.correctionNote.length < 10) throw new HttpError(422, 'TOTAL_DISCREPANCY', 'Totals differ. Correct them or provide an explanation of at least 10 characters for discounts or adjustments.');
}



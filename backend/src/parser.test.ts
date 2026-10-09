import { expect, test } from 'vitest';
import { parseReceipt } from './domain/parser.js';
test('parser identifies totals separately and warns about missing or corrected data', () => {
  const parsed = parseReceipt('FICTIONAL MARKET\n2026-10-09\nAPPLES 3.00\nSUBTOTAL 3.00\nTAX O.99\nTOTAL 3,99');
  expect(parsed.merchant).toBe('FICTIONAL MARKET');
  expect(parsed.purchaseDate).toBe('2026-10-09');
  expect(parsed.totalCents).toBe(399);
  expect(parsed.taxCents).toBe(99);
  expect(parsed.warnings.join(' ')).toContain('corrected');
  expect(parsed.lines).toHaveLength(1);
  expect(parsed.lines[0].description).toBe('APPLES');
  expect(parseReceipt('DEMO\nCOUPON -1.00\nTOTAL 2.00').lines).toHaveLength(0);
  expect(parseReceipt('').totalCents).toBeUndefined();
  expect(parseReceipt('AMBIGUOUS').purchaseDate).toBe('');
});

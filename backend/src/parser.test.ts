import { expect, test } from 'vitest';
import { parseReceipt } from './domain/parser.js';
import {readFileSync} from 'node:fs';
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
test('synthetic discounted and malformed scans require human reconciliation without invented values',()=>{
  const discounted=parseReceipt(readFileSync('backend/fixtures/discounted-fictional.txt','utf8'));
  expect(discounted.lines).toHaveLength(2);expect(discounted.totalCents).toBe(739);expect(discounted.warnings.join(' ')).toContain('Discount');
  const malformed=parseReceipt(readFileSync('backend/fixtures/malformed-fictional.txt','utf8'));
  expect(malformed.purchaseDate).toBe('');expect(malformed.totalCents).toBeUndefined();expect(malformed.lines[0].lineTotalCents).toBe(99);expect(malformed.lines[0].parserConfidence).toBeLessThan(.5);
});

import {expect,test} from 'vitest';
import {csvCell,receiptCsv} from './domain/csv.js';
test('CSV escapes quotes, embedded delimiters and spreadsheet formulas',()=>{
  expect(csvCell('=SUM(1,2)')).toBe('"\'=SUM(1,2)"');expect(csvCell('demo,"store"')).toBe('"demo,""store"""');
  expect(receiptCsv([{id:'demo',rawMerchant:'Fictional',purchaseDate:'2026-10-01',totalCents:123,taxCents:0}])).toContain('"CAD","123","0"');
});

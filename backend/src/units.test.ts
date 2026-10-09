import {expect,test} from 'vitest';
import {normalizeQuantity,unitPrice} from './domain/units.js';
test('decimal-safe unit normalization keeps families separate and includes package quantity',()=>{
  expect(normalizeQuantity('1.5','kg')).toEqual({quantity:'1500',unit:'g',family:'mass'});
  expect(normalizeQuantity('2','each','500','g').quantity).toBe('1000');
  expect(normalizeQuantity('0.1','l').quantity).toBe('100');
  expect(normalizeQuantity('1','each').family).not.toBe(normalizeQuantity('1','kg').family);
  expect(()=>normalizeQuantity('1','kg','500','g')).toThrow();
  expect(unitPrice(100,'3')).toBe('33.333333');
});

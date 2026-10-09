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
test('normalization handles tiny quantities, half-up rounding and incomplete packages',()=>{
  expect(normalizeQuantity('0.000001','kg').quantity).toBe('0.001');
  expect(unitPrice(1,'128')).toBe('0.007813');
  expect(()=>normalizeQuantity('0','g')).toThrow();
  expect(()=>normalizeQuantity('1','each','500')).toThrow();
  expect(()=>normalizeQuantity('1','each',undefined,'g')).toThrow();
});

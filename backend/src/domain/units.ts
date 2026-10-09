import { Decimal } from 'decimal.js';
import { decimalSchema } from './money.js';
import { HttpError } from '../errors.js';
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
const definitions: Record<string,{unit:string;family:string;factor:string}> = {
  g:{unit:'g',family:'mass',factor:'1'}, kg:{unit:'g',family:'mass',factor:'1000'}, ml:{unit:'ml',family:'volume',factor:'1'}, l:{unit:'ml',family:'volume',factor:'1000'}, each:{unit:'each',family:'each',factor:'1'},
};
export function normalizeQuantity(quantity:string, unit:string, packageSize?:string|null, packageUnit?:string|null) {
  let amount = new Decimal(decimalSchema.parse(quantity));
  if (!!packageSize !== !!packageUnit) throw new HttpError(422,'INCOMPLETE_PACKAGE','Specify both package size and package unit.');
  if (packageSize && packageUnit) {
    if (unit !== 'each') throw new HttpError(422,'INCOMPATIBLE_PACKAGE','Package size applies only to quantities counted as each.');
    amount=amount.times(decimalSchema.parse(packageSize)); unit=packageUnit;
  }
  const definition=definitions[unit];
  if (!definition) throw new HttpError(422,'INVALID_UNIT','Unsupported unit.');
  return {quantity:amount.times(definition.factor).toFixed(),unit:definition.unit,family:definition.family};
}
export const unitPrice = (cents:number, quantity:string) => new Decimal(cents).div(quantity).toFixed(6,Decimal.ROUND_HALF_UP);

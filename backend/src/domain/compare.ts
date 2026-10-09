import { Decimal } from "decimal.js";
import { unitPrice } from "./units.js";
interface Recorded {
  merchant: string;
  normalizedUnit: string;
  normalizedQuantityDecimal: string;
  lineTotalCents: number;
  purchaseDate: string;
  receiptId: string;
}
export function compareRecorded(rows: Recorded[]) {
  const groups = new Map<
    string,
    {
      merchant: string;
      unit: string;
      count: number;
      lowestCentsPerUnit: string;
      date: string;
      sourceReceiptId: string;
    }
  >();
  for (const row of rows) {
    const key = JSON.stringify([row.merchant, row.normalizedUnit]);
    const price = unitPrice(row.lineTotalCents, row.normalizedQuantityDecimal);
    const group = groups.get(key);
    if (!group)
      groups.set(key, {
        merchant: row.merchant,
        unit: row.normalizedUnit,
        count: 1,
        lowestCentsPerUnit: price,
        date: row.purchaseDate,
        sourceReceiptId: row.receiptId,
      });
    else {
      group.count++;
      if (new Decimal(price).lt(group.lowestCentsPerUnit)) {
        group.lowestCentsPerUnit = price;
        group.date = row.purchaseDate;
        group.sourceReceiptId = row.receiptId;
      }
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.unit.localeCompare(b.unit) ||
      new Decimal(a.lowestCentsPerUnit).cmp(b.lowestCentsPerUnit),
  );
}

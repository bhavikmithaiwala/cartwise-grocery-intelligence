import { expect, test } from "vitest";
import {
  parseMoney,
  decimalSchema,
  reviewSchema,
  validateTotals,
  dateSchema,
} from "./domain/money.js";
test("strict integer cents, positive decimal quantities and valid calendar dates", () => {
  expect(parseMoney("$12.34")).toBe(1234);
  expect(parseMoney("0.00")).toBe(0);
  for (const input of ["-1.00", "1.001", "1e3", "abc"])
    expect(() => parseMoney(input)).toThrow();
  for (const input of ["0", "-1", "", "NaN", "1e3"])
    expect(decimalSchema.safeParse(input).success).toBe(false);
  expect(dateSchema.safeParse("2026-02-30").success).toBe(false);
  const input = reviewSchema.parse({
    merchant: "Demo",
    purchaseDate: "2026-10-01",
    subtotalCents: 100,
    taxCents: 0,
    totalCents: 100,
    lines: [
      {
        description: "Milk",
        category: "Dairy",
        quantityDecimal: "1",
        quantityUnit: "each",
        lineTotalCents: 100,
      },
    ],
  });
  expect(() => validateTotals(input)).not.toThrow();
  expect(() => validateTotals({ ...input, totalCents: 101 })).toThrow();
  expect(() =>
    validateTotals({
      ...input,
      totalCents: 101,
      correctionNote: "Reviewed rounding adjustment",
    }),
  ).not.toThrow();
});
test("money rejects overflow and preserves decimal edge cases", () => {
  expect(parseMoney("9999999.99")).toBe(999999999);
  expect(() => parseMoney("10000000.00")).toThrow();
  expect(decimalSchema.parse("0.000001")).toBe("0.000001");
  expect(() => decimalSchema.parse("0.000000")).toThrow();
  expect(() => decimalSchema.parse("0.0000001")).toThrow();
  expect(parseMoney("0.10") + parseMoney("0.20")).toBe(30);
});

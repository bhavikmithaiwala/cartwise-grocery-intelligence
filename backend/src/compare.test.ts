import { expect, test } from "vitest";
import { compareRecorded } from "./domain/compare.js";
test("comparison never mixes mass, volume or each observations", () => {
  const base = {
    merchant: "Fictional",
    normalizedQuantityDecimal: "1",
    lineTotalCents: 100,
    purchaseDate: "2026-10-01",
    receiptId: "demo",
  };
  const groups = compareRecorded([
    { ...base, normalizedUnit: "g" },
    { ...base, normalizedUnit: "ml" },
    { ...base, normalizedUnit: "each" },
    { ...base, normalizedUnit: "g", normalizedQuantityDecimal: "2" },
  ]);
  expect(groups).toHaveLength(3);
  expect(groups.find((g) => g.unit === "g")).toMatchObject({
    count: 2,
    lowestCentsPerUnit: "50.000000",
  });
});

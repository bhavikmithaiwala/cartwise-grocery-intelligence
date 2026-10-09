import { afterAll, expect, test } from "vitest";
import { db } from "./db.js";
import { duplicateWarnings } from "./services/duplicates.js";
afterAll(() => db.$disconnect());
test("exact hashes and cautious merchant date total heuristics remain user scoped", async () => {
  const user = await db.user.create({
    data: { email: `dupe-${Date.now()}@example.test`, passwordHash: "fixture" },
  });
  try {
    const a = await db.receipt.create({
      data: {
        userId: user.id,
        fileSha256: "synthetic-hash",
        rawMerchant: "DEMO",
        purchaseDate: "2026-10-01",
        totalCents: 100,
      },
    });
    const b = await db.receipt.create({
      data: { userId: user.id, fileSha256: "synthetic-hash" },
    });
    expect((await duplicateWarnings(user.id, b.id))[0]).toMatchObject({
      id: a.id,
      reason: "exact_file",
    });
    const c = await db.receipt.create({
      data: {
        userId: user.id,
        rawMerchant: "demo",
        purchaseDate: "2026-10-01",
        totalCents: 100,
      },
    });
    expect((await duplicateWarnings(user.id, c.id))[0].reason).toBe(
      "same_merchant_date_total",
    );
    expect(await duplicateWarnings("another-user", c.id)).toEqual([]);
    expect(await db.receipt.count({ where: { userId: user.id } })).toBe(3);
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});

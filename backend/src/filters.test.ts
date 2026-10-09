import { afterAll, expect, test } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { db } from "./db.js";
afterAll(() => db.$disconnect());
test("receipt search validates inclusive date boundaries and stable pagination", async () => {
  const agent = request.agent(app);
  const email = `filters-${Date.now()}@example.test`;
  const registered = await agent
    .post("/api/auth/register")
    .set("X-CartWise-Request", "1")
    .send({ email, password: "fictional-password-123" });
  try {
    for (const date of ["2026-09-30", "2026-10-01", "2026-10-31", "2026-11-01"])
      await db.receipt.create({
        data: {
          userId: registered.body.id,
          purchaseDate: date,
          rawMerchant: "Fictional Market",
          status: "confirmed",
        },
      });
    const result = await agent.get(
      "/api/receipts?from=2026-10-01&to=2026-10-31&status=confirmed",
    );
    expect(result.body.total).toBe(2);
    expect(result.body.items[0].purchaseDate).toBe("2026-10-31");
    expect((await agent.get("/api/receipts?page=-1")).status).toBe(400);
    expect((await agent.get("/api/receipts?month=2026-13")).status).toBe(400);
    expect(
      (await agent.get("/api/receipts?from=2026-10-31&to=2026-10-01")).status,
    ).toBe(400);
  } finally {
    await db.user.deleteMany({ where: { email } });
  }
});

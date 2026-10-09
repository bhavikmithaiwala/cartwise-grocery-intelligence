import { Router } from "express";
import { z } from "zod";
import { requireUser } from "../middleware/owner.js";
import { monthSchema } from "./budgets.js";
import { overview } from "../services/reports.js";
import { db } from "../db.js";
import { dateSchema } from "../domain/money.js";
import { receiptCsv } from "../domain/csv.js";
export const reports = Router();
reports.use(requireUser);
reports.get("/export.csv", async (req, res) => {
  const q = z
    .object({ from: dateSchema, to: dateSchema })
    .refine((q) => q.from <= q.to, "Date range invalid")
    .parse(req.query);
  const rows = await db.receipt.findMany({
    where: {
      userId: req.userId,
      status: "confirmed",
      purchaseDate: { gte: q.from, lte: q.to },
    },
    orderBy: [{ purchaseDate: "asc" }, { id: "asc" }],
  });
  res
    .set("Content-Disposition", 'attachment; filename="cartwise-confirmed.csv"')
    .set("Cache-Control", "no-store")
    .type("text/csv")
    .send(receiptCsv(rows));
});
reports.get("/overview", async (req, res) => {
  const { month } = z.object({ month: monthSchema }).parse(req.query);
  res.json(await overview(req.userId, month));
});
reports.get("/trends", async (req, res) => {
  const { month, months } = z
    .object({
      month: monthSchema,
      months: z.coerce.number().int().min(1).max(24).default(6),
    })
    .parse(req.query);
  const [year, index] = month.split("-").map(Number);
  const data = [];
  for (let offset = months - 1; offset >= 0; offset--) {
    const date = new Date(Date.UTC(year, index - 1 - offset, 1));
    const key = date.toISOString().slice(0, 7);
    const row = await overview(req.userId, key);
    data.push({
      month: key,
      totalCents: row.totalCents,
      receiptCount: row.receiptCount,
    });
  }
  res.json(data);
});

import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { requireUser } from "../middleware/owner.js";
import { deleteImage } from "../services/images.js";
import { verifyPassword } from "../services/passwords.js";
import { HttpError } from "../errors.js";
export const settings = Router();
settings.use(requireUser);
settings.get("/settings", async (req, res) =>
  res.json(
    await db.user.findUniqueOrThrow({
      where: { id: req.userId },
      select: { retainImages: true },
    }),
  ),
);
settings.patch("/settings", async (req, res) => {
  const input = z
    .object({ retainImages: z.boolean() })
    .strict()
    .parse(req.body);
  if (!input.retainImages) {
    const rows = await db.receipt.findMany({
      where: {
        userId: req.userId,
        status: "confirmed",
        imagePath: { not: null },
      },
    });
    for (const row of rows) await deleteImage(row.imagePath);
    await db.receipt.updateMany({
      where: { userId: req.userId, status: "confirmed" },
      data: { imagePath: null, suggestions: "{}" },
    });
  }
  res.json(
    await db.user.update({
      where: { id: req.userId },
      data: input,
      select: { retainImages: true },
    }),
  );
});
settings.post("/account/export", async (req, res) => {
  const user = await db.user.findUniqueOrThrow({
    where: { id: req.userId },
    select: { email: true, createdAt: true, retainImages: true },
  });
  const receipts = await db.receipt.findMany({
    where: { userId: req.userId },
    include: { lines: true },
    orderBy: { createdAt: "asc" },
  });
  const products = await db.canonicalProduct.findMany({
    where: { userId: req.userId },
  });
  const budgets = await db.monthlyBudget.findMany({
    where: { userId: req.userId },
  });
  res.set("Cache-Control", "no-store").json({
    user,
    receipts: receipts.map(
      ({ imagePath: _image, suggestions: _ocr, fileSha256: _hash, ...row }) => {
        void _image;
        void _ocr;
        void _hash;
        return row;
      },
    ),
    products,
    budgets,
  });
});
settings.delete("/account", async (req, res) => {
  const { password } = z
    .object({ password: z.string().max(128) })
    .strict()
    .parse(req.body);
  const user = await db.user.findUniqueOrThrow({ where: { id: req.userId } });
  if (!(await verifyPassword(password, user.passwordHash)))
    throw new HttpError(401, "INVALID_CREDENTIALS", "Password is incorrect.");
  const receipts = await db.receipt.findMany({ where: { userId: req.userId } });
  for (const row of receipts) await deleteImage(row.imagePath);
  await db.user.delete({ where: { id: req.userId } });
  res.clearCookie("session", { path: "/api" }).status(204).end();
});

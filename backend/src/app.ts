import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { auth } from "./controllers/auth.js";
import { errors, HttpError } from "./errors.js";
import { receipts } from "./controllers/receipts.js";
import { requireUser } from "./middleware/owner.js";
import { db } from "./db.js";
import { categories } from "./domain/money.js";
import { products } from "./controllers/products.js";
import { prices } from "./controllers/prices.js";
import { budgets } from "./controllers/budgets.js";
import { reports } from "./controllers/reports.js";
import { settings } from "./controllers/settings.js";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "256kb" }));
app.use(cookieParser());
app.use("/api", (req, _res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const expected = process.env.APP_ORIGIN ?? "http://127.0.0.1:5173";
    if (req.get("origin") && req.get("origin") !== expected)
      return next(
        new HttpError(403, "ORIGIN_REJECTED", "Request origin rejected."),
      );
    if (req.get("X-CartWise-Request") !== "1")
      return next(
        new HttpError(
          403,
          "CSRF_REJECTED",
          "Missing request protection header.",
        ),
      );
  }
  next();
});
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "cartwise-api", currency: "CAD" }),
);
app.use("/api/auth", auth);
app.use("/api/receipts", receipts);
app.use("/api/products", products);
app.use("/api/prices", prices);
app.use("/api/budgets", budgets);
app.use("/api/reports", reports);
app.use("/api", settings);
app.get("/api/categories", requireUser, (_req, res) => res.json(categories));
app.get("/api/merchants", requireUser, async (req, res) => {
  const merchants = await db.receipt.findMany({
    where: { userId: req.userId, rawMerchant: { not: "" } },
    select: { rawMerchant: true },
    distinct: ["rawMerchant"],
    orderBy: { rawMerchant: "asc" },
  });
  res.json(merchants.map((m) => m.rawMerchant));
});
app.use("/api", (_req, res) =>
  res
    .status(404)
    .json({ code: "NOT_FOUND", message: "API endpoint not found." }),
);
const webRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../frontend/dist",
);
if (existsSync(webRoot)) {
  app.use(express.static(webRoot));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(resolve(webRoot, "index.html")),
  );
}
app.use(errors);

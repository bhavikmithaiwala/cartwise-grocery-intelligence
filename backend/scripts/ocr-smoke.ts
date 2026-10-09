import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
const text = [
  "FICTIONAL DEMO MARKET",
  "2026-10-09",
  "APPLES 3.00",
  "MILK 4.50",
  "SUBTOTAL 7.50",
  "TAX 0.00",
  "TOTAL 7.50",
];
const svg = `<svg width="900" height="650" xmlns="http://www.w3.org/2000/svg"><rect width="900" height="650" fill="white"/>${text.map((line, i) => `<text x="45" y="${65 + i * 75}" font-family="Arial" font-size="42" fill="black">${line}</text>`).join("")}</svg>`;
await mkdir("fixtures", { recursive: true });
await mkdir("storage/ocr-cache", { recursive: true });
await sharp(Buffer.from(svg)).png().toFile("fixtures/legible-fictional.png");
const worker = await createWorker("eng", 1, {
  cachePath: resolve("storage/ocr-cache"),
});
try {
  const { data } = await worker.recognize("fixtures/legible-fictional.png");
  if (!data.text.includes("7.50") || !data.text.includes("MILK"))
    throw new Error("Synthetic OCR smoke did not detect expected text.");
  console.log(
    "Actual local Tesseract smoke passed: fictional product and total recognized.",
  );
} finally {
  await worker.terminate();
}

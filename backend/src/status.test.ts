import { expect, test } from "vitest";
import { assertTransition } from "./domain/status.js";
test("OCR cannot confirm directly and discarded or confirmed receipts cannot be imported again", () => {
  expect(() => assertTransition("processing", "confirmed")).toThrow();
  expect(() => assertTransition("discarded", "confirmed")).toThrow();
  expect(() => assertTransition("confirmed", "confirmed")).toThrow();
  expect(() => assertTransition("needs_review", "confirmed")).not.toThrow();
  expect(() => assertTransition("failed", "processing")).not.toThrow();
});

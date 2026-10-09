import { expect, test } from "vitest";
import request from "supertest";
import { app } from "./app.js";

test("health endpoint identifies the running API and currency", async () => {
  const response = await request(app).get("/api/health");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    status: "ok",
    service: "cartwise-api",
    currency: "CAD",
  });
  expect(response.headers["x-powered-by"]).toBeUndefined();
});

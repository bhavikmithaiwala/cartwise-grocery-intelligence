import { afterAll, expect, test } from "vitest";
import request from "supertest";
import { app } from "./app.js";
import { db } from "./db.js";
afterAll(() => db.$disconnect());
test("registration, login, cookie authentication and logout use persisted secure sessions", async () => {
  const agent = request.agent(app);
  const email = `auth-${Date.now()}@example.test`;
  const data = { email, password: "fictional-password-123" };
  try {
    expect((await agent.get("/api/auth/me")).status).toBe(401);
    const registered = await agent
      .post("/api/auth/register")
      .set("X-CartWise-Request", "1")
      .send(data);
    expect(registered.status).toBe(201);
    expect(registered.headers["set-cookie"][0]).toContain("HttpOnly");
    expect((await agent.get("/api/auth/me")).body.email).toBe(email);
    expect(
      (await db.user.findUniqueOrThrow({ where: { email } })).passwordHash,
    ).not.toContain(data.password);
    expect(
      (await agent.post("/api/auth/logout").set("X-CartWise-Request", "1"))
        .status,
    ).toBe(204);
    expect((await agent.get("/api/auth/me")).status).toBe(401);
    expect(
      (
        await agent
          .post("/api/auth/login")
          .set("X-CartWise-Request", "1")
          .send({ ...data, password: "incorrect-password" })
      ).status,
    ).toBe(401);
    expect(
      (
        await agent
          .post("/api/auth/login")
          .set("X-CartWise-Request", "1")
          .send(data)
      ).status,
    ).toBe(200);
    expect((await agent.post("/api/auth/logout")).status).toBe(403);
    expect(
      (
        await agent
          .post("/api/auth/logout")
          .set("X-CartWise-Request", "1")
          .set("Origin", "https://other.example")
      ).status,
    ).toBe(403);
    await db.session.updateMany({
      where: { user: { email } },
      data: { expiresAt: new Date(0) },
    });
    expect((await agent.get("/api/auth/me")).status).toBe(401);
    expect(
      (await request(app).get("/api/auth/me").set("Cookie", "session=forged"))
        .status,
    ).toBe(401);
  } finally {
    await db.user.deleteMany({ where: { email } });
  }
});

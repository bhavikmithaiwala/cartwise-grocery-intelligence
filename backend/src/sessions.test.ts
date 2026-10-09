import { afterAll, expect, test } from "vitest";
import { db } from "./db.js";
import {
  createSession,
  hashToken,
  lookupSession,
  revokeSession,
} from "./services/sessions.js";
afterAll(() => db.$disconnect());
test("sessions store only hashed tokens and reject revoked or expired tokens", async () => {
  const user = await db.user.create({
    data: {
      email: `session-${Date.now()}@example.test`,
      passwordHash: "synthetic-test-only",
    },
  });
  try {
    const session = await createSession(user.id);
    const stored = await db.session.findFirstOrThrow({
      where: { userId: user.id },
    });
    expect(stored.tokenHash).toBe(hashToken(session.token));
    expect(stored.tokenHash).not.toBe(session.token);
    expect((await lookupSession(session.token))?.userId).toBe(user.id);
    await revokeSession(session.token);
    expect(await lookupSession(session.token)).toBeNull();
    const expired = await createSession(user.id);
    await db.session.updateMany({
      where: { tokenHash: hashToken(expired.token) },
      data: { expiresAt: new Date(0) },
    });
    expect(await lookupSession(expired.token)).toBeNull();
  } finally {
    await db.user.delete({ where: { id: user.id } });
  }
});

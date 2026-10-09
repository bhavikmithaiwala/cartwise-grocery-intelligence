import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../db.js';
import { HttpError } from '../errors.js';
import { hashPassword, verifyPassword } from '../services/passwords.js';
import { createSession, revokeSession, lookupSession } from '../services/sessions.js';
export const auth = Router();
const credentials = z.object({ email: z.email().max(254).transform(s => s.toLowerCase()), password: z.string().min(10).max(128) }).strict();
const cookieOptions = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/api' };
auth.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-8', legacyHeaders: false, message: { code: 'RATE_LIMITED', message: 'Too many authentication requests. Try again later.' } }));
for (const action of ['register', 'login'] as const) {
  auth.post(`/${action}`, async (req, res) => {
    const input = credentials.parse(req.body);
    let user;
    if (action === 'register') user = await db.user.create({ data: { email: input.email, passwordHash: await hashPassword(input.password) } });
    else {
      user = await db.user.findUnique({ where: { email: input.email } });
      const valid = await verifyPassword(input.password, user?.passwordHash ?? await hashPassword('dummy-password-constant'));
      if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    }
    if (req.cookies?.session) await revokeSession(req.cookies.session);
    const session = await createSession(user.id);
    res.cookie('session', session.token, { ...cookieOptions, expires: session.expiresAt });
    res.status(action === 'register' ? 201 : 200).json({ id: user.id, email: user.email });
  });
}
auth.post('/logout', async (req, res) => {
  if (req.cookies?.session) await revokeSession(req.cookies.session);
  res.clearCookie('session', cookieOptions).status(204).end();
});
auth.get('/me', async (req, res) => {
  const session = req.cookies?.session && await lookupSession(req.cookies.session);
  if (!session) throw new HttpError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
  res.json({ id: session.user.id, email: session.user.email });
});

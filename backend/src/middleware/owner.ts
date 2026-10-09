import type { RequestHandler } from "express";
import { lookupSession } from "../services/sessions.js";
import { HttpError } from "../errors.js";
declare global {
  // Express request augmentation uses the library's global namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
export const requireUser: RequestHandler = async (req, _res, next) => {
  const token = req.cookies?.session;
  const session =
    typeof token === "string" &&
    token.length === 64 &&
    (await lookupSession(token));
  if (!session)
    throw new HttpError(401, "UNAUTHENTICATED", "Sign in to continue.");
  req.userId = session.userId;
  next();
};
export const ownerWhere = (userId: string, id: string) => ({ id, userId });

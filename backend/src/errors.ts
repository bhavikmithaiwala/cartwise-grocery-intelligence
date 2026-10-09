import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) { res.status(400).json({ code: 'INVALID_INPUT', message: 'Check the submitted fields.', fieldErrors: error.flatten().fieldErrors }); return; }
  if (error instanceof HttpError) { res.status(error.status).json({ code: error.code, message: error.message }); return; }
  if (error?.code === 'P2002') { res.status(409).json({ code: 'CONFLICT', message: 'This record already exists.' }); return; }
  if (error?.type === 'entity.too.large') { res.status(413).json({ code: 'TOO_LARGE', message: 'Request too large.' }); return; }
  if (error instanceof SyntaxError) { res.status(400).json({ code: 'INVALID_JSON', message: 'Invalid JSON request.' }); return; }
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'The request could not be completed.' });
};

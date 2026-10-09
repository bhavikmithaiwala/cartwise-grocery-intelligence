import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { auth } from './controllers/auth.js';
import { errors, HttpError } from './errors.js';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use('/api', (req, _res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const expected = process.env.APP_ORIGIN ?? 'http://127.0.0.1:5173';
    if (req.get('origin') && req.get('origin') !== expected) return next(new HttpError(403, 'ORIGIN_REJECTED', 'Request origin rejected.'));
    if (req.get('X-CartWise-Request') !== '1') return next(new HttpError(403, 'CSRF_REJECTED', 'Missing request protection header.'));
  }
  next();
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'cartwise-api', currency: 'CAD' }));
app.use('/api/auth', auth);
app.use(errors);

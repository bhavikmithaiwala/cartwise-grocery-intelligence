# Local production build and hosting considerations

No hosted deployment is claimed. This document describes a single-host configuration. Fresh migrations, repeated seed runs and compiled SPA/API HTTP smoke passed locally; final evidence is tracked in `PROGRESS.md`.

1. Install Node 22, run `npm ci`, and copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL`, `PORT` and `APP_ORIGIN` for the environment. Keep SQLite and private image/cache storage on durable private disk. Never place either under the frontend static directory.
3. Run `npm run db:migrate`, optional fictional `npm run db:seed`, and `npm run build`.
4. `npm start` serves the compiled API and built SPA on port 3001 in local mode. HTTPS production requires `NODE_ENV=production`, a TLS reverse proxy and `APP_ORIGIN` matching the public HTTPS origin. Secure cookies will not work over plain HTTP in production mode.
5. Keep one API/OCR process. Multiple instances need coordinated jobs, shared storage and a different database deployment plan.

The API binds loopback by default. For remote hosting explicitly configure `HOST` and a reverse proxy. Limit reverse-proxy upload bodies to 8 MB plus multipart overhead. Do not allow the proxy to expose `backend/storage` or SQLite files. Enforce HTTPS before enabling production cookies.

No production credentials, real receipt data or database files belong in Git. Public demo credentials are only for fictional local data. Do not seed publicly reachable production accounts. Configure backup retention and deletion separately; account deletion cannot retract external backups or JSON/CSV exports.

OCR requires initial language-model download/cache and can consume CPU. Interrupted jobs become failed on startup, rather than silently importing spending. Filesystem errors/crashes can leave orphaned files; reconcile private storage during maintenance. Maintain adequate disk space and protect local OS accounts.

For CI, Playwright launches its own local servers and uses `e2e.db`; unit/integration tests use `test.db`. Hosted CI success should be reported only after observing the Actions result.

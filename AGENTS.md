# CartWise: persistent instructions for coding agents

Read `docs/PROJECT_REFERENCE.md`, `docs/COMMIT_ROADMAP.md`, `docs/ACCEPTANCE_AND_DEMO.md`, and `docs/INTERVIEW_NOTES.md` before coding. Treat these as requirements, not implementation evidence. Keep `docs/PROGRESS.md` accurate as you work.

## Goal
Build **CartWise — Grocery Receipt & Price Intelligence**, a genuine full-stack junior-developer portfolio application. Users upload grocery receipt images, review imperfect OCR extraction, save verified purchases, see spending trends, and compare *their own recorded historical prices*. No pretend live retail prices.

## Working style
- Work in the already-cloned repository; do not create another repository or discard pre-existing work.
- Inspect existing files, `git status`, branch, and remote before any modifications. Preserve uncommitted changes.
- Follow the roadmap in order; aim for **50 meaningful incremental commits**. A commit must contain a coherent, implemented change. Do not create empty commits or manufacture changes to satisfy a count.
- Implement and test features *before* committing; keep the application runnable at milestones. A failed test must be reported, not hidden or bypassed.
- Use real author/committer timestamps. Do not backdate or fabricate development history. Never rewrite published history or force-push.
- Do not push until the final lint, type check, test, and build checks finish and the remote is safely synchronized. Never push secrets.
- Continue independently unless encountering required credentials, paid services, destructive operations, or an actual blocker. Record blockers in `docs/PROGRESS.md`.
- Do not claim deployment, measured OCR accuracy, production security, or tests passed unless demonstrated.

## Architecture preferences
- `frontend/`: React, TypeScript, Vite, CSS, React Router, accessible forms, lightweight charting.
- `backend/`: Node.js, Express, TypeScript, Prisma + SQLite, Zod, image upload validation, Tesseract.js (or equivalent local OCR supported by platform).
- Monorepo npm workspaces or straightforward root scripts; keep local setup one-command or well documented.
- Use typed contracts, controllers/services/data access separation, explicit validation, centralized error handling, migrations, seeded fictional data, readable code.
- No Kubernetes, microservices, Redis, external paid AI/price APIs, or unnecessary frameworks for the first release.

## Non-negotiable domain rules
- **Money:** Store CAD amounts in integer cents. Never store balances or item totals as binary floating-point dollars. For decimal unit quantities use string/decimal arithmetic, and document the rounding rule.
- **Receipt OCR is untrusted:** Treat extraction as suggestions. Users must review and confirm before importing transactions into analytics. Never imply an unreviewed result is accurate.
- **Privacy:** Receipt images can contain card fragments, loyalty numbers, addresses, and other personal data. Enforce user-level access, private storage, file size/type limits, explicit image-retention controls, and scrub sensitive logs. Do not push actual user receipts or real personal information.
- **Duplicate receipts:** Use exact uploaded-file hash plus a cautious merchant/date/total heuristic with user review. Do not silently delete or auto-merge data based on fuzzy matches.
- **Comparisons:** Historical price observations only, with equivalent package size and unit. Never compare incompatible units (e.g., 1 L versus 1 kg, or each versus kg) or present historical user prices as live store prices.
- **Security:** Authentication/authorization on backend. HttpOnly session cookies, CSRF/origin protection, request validation, rate limiting on sensitive endpoints, isolated user data, safe file names and paths.

## Definition of done
Document how to start both apps and SQLite, perform migrations, run seed data, run tests, and build for production. Provide an actual runnable flow: sign in -> upload or enter a receipt -> OCR preview -> correct lines -> confirm -> see dashboard and price history. Automated tests must cover money, OCR parsing, duplicates, isolation, and confirmed-only reporting.

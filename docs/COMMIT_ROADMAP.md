# CartWise — Exactly 50 planned incremental implementation milestones

**Target:** 50 meaningful *new* commits. This is a task sequence, not permission to invent empty commits. If a step genuinely requires multiple changes or is already completed, adapt the number and explain deviations in `docs/PROGRESS.md`. The existing repository might already contain a GitHub-generated initial commit: count and preserve it separately. Use actual timestamps, do not rewrite old history, and never force-push.

Each step lists a commit title and its acceptance outcome. Commit a change only after relevant checks pass.

## Phase 1 — Repository and foundation (1–7)
1. `chore: establish CartWise monorepo and project references` — root scripts, Git ignores, `frontend/`, `backend/`, project docs and working setup instructions.
2. `chore: scaffold React TypeScript frontend with Vite` — frontend starts successfully; remove default template clutter.
3. `chore: scaffold Express TypeScript API and health endpoint` — `/api/health` returns a meaningful health response.
4. `chore: configure Prisma SQLite schema and first migration` — migrations work locally and in a clean environment.
5. `feat: implement responsive application shell and routing` — real navigation to Dashboard, Receipts, Upload, Prices, Budgets, Reports, Settings.
6. `style: add reusable UI design system and form components` — accessible forms, badges, errors, buttons, empty/loading states.
7. `chore: configure typed API client and development proxy` — frontend calls backend without hard-coded localhost URLs in UI components.

## Phase 2 — Identity and data isolation (8–12)
8. `feat: add user and hashed session persistence models` — Prisma models and indexes, session revocation and expiry fields.
9. `feat: implement registration login and logout endpoints` — server-side password hashing and HttpOnly sessions.
10. `feat: enforce authentication session expiry and user ownership` — auth middleware and scoped query helpers, safe errors.
11. `feat: add sign in and registration screens` — validated fields and actionable errors.
12. `feat: protect application routes and show current account` — auth bootstrap, guarded navigation, logout; user isolation smoke check.

## Phase 3 — Receipt ingestion, OCR, and human review (13–24)
13. `feat: model receipts line items and OCR jobs` — schema, status state machine, owner relations and indexes.
14. `feat: implement secure receipt image validation and storage` — multipart upload validates image magic, bytes, dimensions and private paths.
15. `feat: create receipt upload UI with file validation` — select/drag file and see progress, rejected-file errors.
16. `feat: add receipt upload and processing status APIs` — processing state and user-scoped job status.
17. `feat: implement bounded local OCR worker adapter` — Tesseract adapter with bounded concurrency and safe failures.
18. `feat: parse merchant date and receipt totals from OCR text` — deterministic parser with testable structured output and uncertainty flags.
19. `feat: extract OCR item rows and confidence hints` — proposed item rows; preserve raw text and warn on uncertain items.
20. `feat: build OCR review and correction form` — editable merchant/date/line items/totals before confirmation.
21. `feat: validate financial totals and receipt line arithmetic` — cents-safe parsing, discrepancy validation and clear feedback.
22. `feat: confirm reviewed receipts with transactional persistence` — confirmation is atomic and the only way data enters spending reports.
23. `feat: detect exact and likely duplicate receipts` — SHA-256 exact match and heuristic warning; explicit user decision.
24. `feat: support manual receipt entry and OCR retry` — usable fallback plus limited retry/failed state handling.

## Phase 4 — Product and historical price intelligence (25–33)
25. `feat: implement merchants categories and receipt listing APIs` — user-scoped merchant/category/receipt endpoints with pagination.
26. `feat: create searchable receipt history and details pages` — status, merchant, date filters and confirmed/pending distinction.
27. `feat: model canonical products and reviewed line mappings` — user-reviewed canonical links; never auto-merge fuzzy matches.
28. `feat: add product mapping controls during receipt review` — review UI supports raw name to canonical item mapping.
29. `feat: normalize equivalent package units safely` — kg/g and L/mL transforms, reject incompatible comparisons.
30. `feat: derive confirmed receipt price observations` — observation records created or refreshed atomically after confirmation.
31. `feat: expose historical item price API with source references` — product, store, package, date and recorded price.
32. `feat: create interactive product price history charts` — user chooses product, unit and date range with honest missing-data states.
33. `feat: compare recorded prices by store and normalized unit` — apples-to-apples comparison, never pretend live store prices.

## Phase 5 — Budgets and analytics (34–40)
34. `feat: add monthly category budget models and endpoints` — unique constraints and integer-cent limits.
35. `feat: create budget planning and progress screens` — edit budgets, budget remaining and overspend warnings.
36. `feat: implement monthly spending summary calculations` — confirmed receipts only, local purchase dates, documented tax policy.
37. `feat: add dashboard summary cards and recent receipts` — live data from API, no hard-coded counts.
38. `feat: create category merchant and monthly trend charts` — chart labels, filtering, accessible table alternatives.
39. `feat: implement receipt and spending search filters` — stable pagination, safe date boundaries and API validation.
40. `feat: support safe CSV export of confirmed receipts` — CSV escaping, formula injection mitigation, deterministic output.

## Phase 6 — Engineering quality and end-to-end proof (41–46)
41. `test: cover money quantity and unit normalization logic` — cents and decimal edge cases pass deterministic tests.
42. `test: cover OCR parsing and human correction scenarios` — synthetic receipts and malformed OCR inputs.
43. `test: verify duplicate receipts and idempotent confirmation` — exact duplicate and parallel confirm tests.
44. `test: enforce user isolation authentication and upload security` — wrong-user access, unsafe files, unauthorized operations.
45. `test: add React form and receipt review interaction tests` — accessible forms and submit/error behaviour.
46. `test: validate end to end receipt to analytics workflow` — Playwright or equivalent real-browser demo using local server.

## Phase 7 — Documentation, CI and release (47–50)
47. `chore: configure GitHub Actions quality pipeline` — install, lint, typecheck, unit/integration tests and build.
48. `docs: document OCR architecture security and engineering decisions` — diagrams, trade-offs, money and data retention policy.
49. `docs: create recruiter ready README and verified demo walkthrough` — screenshot(s), instructions, honest feature status, real test commands.
50. `chore: verify builds seed data and deployment readiness` — clean installation and migration, smoke demo, release limitations.

## Checkpoints
- After 7: frontend and backend start.
- After 12: secured accounts and user isolation.
- After 24: actual receipt upload/OCR/manual entry/review/confirm works end to end.
- After 33: recorded product price history shows only comparable data.
- After 40: budget/report calculations use confirmed receipt amounts.
- After 46: real tests exercise money, duplicates, privacy and review workflow.
- After 50: docs, CI and local/demo build verified, with known limitations disclosed.

Keep `docs/PROGRESS.md` as a status ledger; do not commit a fake retrospective story or invented benchmarks. If you cannot run Tesseract or browser tests in the environment, clearly record the unmet acceptance requirement and exact instructions to reproduce it.

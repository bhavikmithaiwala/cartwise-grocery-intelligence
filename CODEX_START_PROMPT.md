# Codex start prompt — CartWise

You are operating inside my existing, locally cloned GitHub repository for **CartWise — Grocery Receipt & Price Intelligence**.

## Read the reference files before coding
1. `AGENTS.md`
2. `docs/PROJECT_REFERENCE.md`
3. `docs/COMMIT_ROADMAP.md`
4. `docs/ACCEPTANCE_AND_DEMO.md`
5. `docs/INTERVIEW_NOTES.md`

Read all files fully, then inspect `git status`, the current branch, the remote, and existing contents. This is **not** an invitation to create another GitHub repository. If existing code is present, preserve it and reconcile the roadmap to avoid duplicate features.

## Objective
Actually build a complete, working, full-stack React + Node.js application that lets users:
- Register and sign in securely.
- Upload a grocery receipt image, see actual local OCR progress, and correct extraction results before confirming.
- Manually enter a receipt if OCR is unavailable.
- Save verified purchases in SQLite through a typed Express REST API.
- View monthly spending, merchant/category summaries, budgets and historical product prices from their own confirmed receipts.
- See comparable per-unit prices only when product identity and units match, with a date/store/source reference.
- Catch potential duplicate receipts, handle malformed scans, and export data safely.

**No mock-only features.** Do not falsely describe historical receipt data as live prices. Do not represent synthetic fixtures as actual prices or users.

## Commit instructions
- Follow `docs/COMMIT_ROADMAP.md` in sequence, targeting **50 meaningful incremental commits** of actual working changes.
- Implement and locally verify each feature *before* committing that feature. Do not generate all files at once and then manufacture commits retrospectively.
- Preserve any GitHub-created initial commit; count the new implementation commits accurately and explain how many exist total.
- Use short descriptive conventional commit messages exactly or closely based on the roadmap. One coherent capability per commit.
- **Do not backdate**, falsify author/committer timestamps, create empty commits, or modify existing commits to make a false timeline. Use genuine timestamps. Do not force-push.
- Keep `docs/PROGRESS.md` with an up-to-date milestone checklist, working features, verification run, remaining issues, and last completed commit. If you reach a session limit, leave the repository in a consistent state and resume later from that ledger.
- Review staged files before committing; do not commit secrets, real receipts, personal data, `node_modules`, SQLite data files, temporary uploads, or build output.

## Implementation expectations
- **Frontend:** React + TypeScript + Vite, routed and responsive screens; usable forms and dialogs; accessible navigation; receipt review state; truthful loading/error/success states.
- **Backend:** Express + TypeScript, Prisma + SQLite, Zod validation, owner-scoped queries, secure session authentication, CSRF/origin controls, sensible upload limits, bounded OCR worker.
- **OCR:** Integrate actual Tesseract.js (or documented compatible local OCR). A deterministic parser and correction layer must work with supplied synthetic sample fixtures. A manual-entry fallback is mandatory.
- **Financial rules:** cents as integers, precise decimal quantities, confirmed-only analytics, duplicate warning and idempotent confirmation, audited/clearly documented tax policy.
- **Product comparisons:** only verified item mapping and compatible normalized units; show merchant, date and receipt source. No fake current pricing.
- **Tests:** deterministic unit and integration tests, React component tests, and a browser E2E smoke test for receipt -> correction -> confirmation -> dashboard. Also test authentication isolation, duplicate prevention, file validation, month boundaries and rounding.
- **Docs:** build complete README, API documentation, setup/seed, architecture, screenshots from the real running app, engineering decisions, limitations and a demo walkthrough.

## Work and testing cadence
1. Inspect existing code and environment.
2. Implement a coherent roadmap feature.
3. Run relevant lint, type-check and tests; fix failures.
4. Review the diff, stage only related files, and commit.
5. Update progress ledger; continue without waiting for routine approval.
6. At major checkpoints, run both apps and walk a real API/UI path.
7. Before final delivery, run a clean installation/migration/seed if possible, all applicable tests and both production builds. Record exact results and any blocker.
8. Push the verified history to the repository's already-configured `origin` only if access, synchronization and permissions allow. Never overwrite a remote branch using force.

## Quality gate
The key proof isn't simply a large codebase: a reviewer must be able to reproduce the OCR review, verify money calculations and duplicate handling, see accurate per-unit price comparison, and demonstrate that accounts cannot view each other's receipts.

## Final report
Give me: implemented features with demo paths; count of actual **new** commits and recent commit hashes; how to run both services; all executed tests with results; generated screenshots and docs; known limitations; GitHub push status and repository URL; and a short 90-second project demo script. If work is incomplete, identify the last finished roadmap milestone and next steps honestly.

**Start building now. Do not stop at writing a plan or producing starter scaffolding.**

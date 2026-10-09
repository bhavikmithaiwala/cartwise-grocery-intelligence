# CartWise — Project reference and engineering specification

## 1. Problem and scope
**CartWise — Grocery Receipt & Price Intelligence** helps individuals understand grocery spending from the receipts they already receive. Instead of manually retyping every purchase, a user uploads a receipt image, receives OCR-based extraction, fixes mistakes, confirms the purchase, and can then examine monthly/category totals and their *own historical* prices.

**Target audience:** junior full-stack portfolio reviewers and a single household/user testing local demos. **Scope:** working, testable web frontend and backend with a local SQLite database. No payments, bank integrations, scraping grocery retailer websites, real-time pricing claims, or LLM services are required.

## 2. Recommended stack
- Frontend: React + TypeScript + Vite, React Router, CSS, TanStack Query or a small data-fetching layer, Recharts or another modest chart library.
- Backend: Node.js LTS + Express + TypeScript, Zod for input validation, Prisma ORM with SQLite, bcryptjs (or suitable maintained password hashing), opaque rotating server-side sessions stored hashed in DB, cookies.
- OCR: Tesseract.js with a bounded worker/queue and Sharp for validated images/preprocessing. Document where OCR language files are cached/downloaded. Design the OCR adapter so parsing tests are deterministic without the OCR engine.
- Testing: Vitest for domain utilities and backend, Supertest for API integration, React Testing Library for UI, Playwright for a primary E2E workflow; a seeded test SQLite database separate from dev.
- DevOps: npm scripts, `.env.example`, GitHub Actions (install, lint, typecheck, test, build), deployment notes, no paid infrastructure needed.
- Do not pin a version without verifying compatible current versions in the project.

## 3. Main screens and user experience
1. **Sign in / Register:** local demo account registration/login and logout.
2. **Dashboard:** current month's groceries, budget remaining, receipt count, top categories, spending trend, recently confirmed receipts.
3. **Upload receipt:** drag/drop image, progress, size/type validation, asynchronous OCR status.
4. **Review extraction:** merchant, local purchase date, subtotal/tax/total and editable line items; visibly mark low-confidence suggestions. Confirm or discard.
5. **Receipts:** list with merchant, date, total, filters, details, edit/correction auditing and deletion rules.
6. **Price history:** search canonical grocery items and inspect prices from *the user's confirmed receipts*, with store/date, comparable unit, package size, and “not enough data” states.
7. **Budgets:** configure category monthly budgets and compare actual spending.
8. **Reports:** month-by-month charts, category/merchant breakdowns and CSV export.
9. **Settings:** retention policy, export or delete account data, app limitations.

All visible navigation controls must work; placeholders are unacceptable for released features. Add keyboard focus styles, labels, dialog focus management, responsive layouts, and truthful empty/error states.

## 4. Primary user workflows
### A. Scan and confirm a receipt
1. Authenticated user selects a JPG/PNG/WebP photo (PDF optional stretch feature).
2. Backend validates authentication, content length, actual MIME/file magic, decoded dimensions, and maximum pixels; rejects unsafe files. Suggested defaults: 8 MB and safe pixel limits; document exact limits.
3. Backend writes image to an isolated private location using generated random path, computes SHA-256 hash, and creates a Receipt with `processing` status and OCR job record.
4. OCR worker runs (bounded concurrency), generates raw text and extraction candidates; status becomes `needs_review` or `failed`. A job failure must not create confirmed spending.
5. Review screen shows extracted merchant, date, totals and line items as **suggestions**, including confidence/uncertain fields. User edits all relevant values.
6. Backend validates the candidate. On explicit confirmation, save verified receipt and lines in a DB transaction, deriving analytics only from confirmed data.
7. User may choose whether the original image is retained. Document deletion consequences and retention defaults; images must not become publicly accessible.

### B. Manual entry fallback
A receipt can be entered without OCR; this is an important fallback when OCR isn't available, and also makes E2E tests reliable.

### C. Price history
A line item becomes a price observation only after its receipt is confirmed. Match to a canonical product via user-reviewed mapping, preserving raw OCR text. Normalize quantities and units to compare compatible packaged items. Never use a fuzzy match as an automatic merge. Show date, store, package/normalized unit and source receipt.

### D. Budgeting
Users set per-category, per-month limits. Report spending by purchase date (not upload time) from confirmed receipts, with documented tax allocation policy and category treatment. Validate totals and prevent cents rounding drift.

## 5. Example architecture
```
React UI (Vite)
  ├── Auth, Dashboard, Upload, Review, Receipts, Prices, Budgets, Reports
  └── Typed HTTP client (relative /api, dev proxy)
            |
          HTTPS
            |
Express API (validation, authentication, rate limits)
  ├── AuthService + SessionService
  ├── UploadService + private file store
  ├── OCRService (Tesseract adapter, bounded worker)
  ├── ReceiptParser -> ReviewService -> ConfirmationService
  ├── PriceObservationService / ProductNormalizer
  ├── BudgetService / ReportService
  └── Prisma / SQLite
```

A single-process OCR worker is fine initially; document that long-running OCR work is not yet a distributed job service and that restarting can interrupt in-flight jobs. Add safe retry/recovery behaviour.

## 6. Suggested persisted data model
- **User:** id, email (unique), passwordHash, createdAt.
- **Session:** id, userId, tokenHash (unique), expiresAt, revokedAt, createdAt; raw token only in HttpOnly cookie.
- **Merchant:** id, userId, displayName, normalizedName; user-scoped, unique normalized identifier where appropriate.
- **Category:** id, userId (or standard category catalog), name, active.
- **Receipt:** id, userId, merchantId?, rawMerchant, purchaseDate (`YYYY-MM-DD` interpreted as local receipt date), currency (`CAD` in v1), status (`processing|needs_review|confirmed|failed|discarded`), subtotalCents?, taxCents?, totalCents?, fileSha256?, imagePath?, ocrTextPath? or limited private text, confirmedAt?, createdAt, updatedAt. Keep a clear correction policy.
- **ReceiptLine:** id, receiptId, rawText, description, canonicalProductId?, categoryId?, quantityDecimal (validated decimal string), quantityUnit (`each|g|kg|ml|l` etc.), packageSizeDecimal?, packageUnit?, unitPriceCents?, lineTotalCents, parserConfidence?, reviewedByUser.
- **CanonicalProduct:** id, userId, name, unitFamily and optional package identity; user-reviewed mapping of variants.
- **PriceObservation:** id, userId, confirmedReceiptId, receiptLineId (unique), canonicalProductId, merchantId?, purchaseDate, normalizedQuantityDecimal and normalizedUnit, lineTotalCents; derived unit price computed with precise decimal math.
- **MonthlyBudget:** id, userId, categoryId, month (`YYYY-MM`), limitCents; unique(userId, categoryId, month).
- **OcrJob:** id, receiptId, status, attemptCount, startedAt?, finishedAt?, safeErrorCode?; never log sensitive raw text.

Include foreign keys, indexes for user/date/status, user/category/month, and user/product/date. Carefully define cascade or soft-delete rules; no orphaned price observations.

## 7. Accuracy and monetary rules
- **Currency:** CAD only in v1. Label all reports. Do not silently combine different currencies.
- **Money:** cents as integers; parse and format with strict validation (`$12.34` -> `1234`). Do not use JS floating point for adding prices; use decimal-safe multiplication/rounding for quantities.
- **Receipts:** OCR totals may be inconsistent due to discounts, tax or OCR error. Show discrepancies and require resolution or an explicit, documented override with warning before confirmation. Do not invent missing totals.
- **Tax/category reporting:** Choose and clearly document whether budgets count item line totals and how receipt-level taxes/discounts are allocated. Prefer v1 budgets based on reviewed item line totals excluding unallocated receipt-level tax; separately show total receipt spending with tax.
- **Quantities:** decimal strings with validation; unit normalization maps kg->g and L->mL only within the same measurement family. Quantity must be positive.
- **Price comparisons:** distinguish paid line total from price-per-normalized-unit; show units and package sizes. Incompatible packs/units must be grouped separately.
- **Confidence:** a parser confidence is a heuristic, not a guarantee; always require review.

## 8. Duplicate detection and ingestion idempotency
- Exact duplicate: SHA-256 of original uploaded file, scoped per user; on repeat show “potential duplicate” rather than inserting another confirmed receipt invisibly.
- Near duplicate heuristic: merchant/date/total and optional item overlap, with clear confidence; only a user decides whether it is duplicate.
- Require an idempotency key or enforce unique confirmation transition to prevent double submissions.
- Tests: same exact upload twice; different crops of same receipt; coincidentally same-date-and-total receipts; double-click confirm; parallel confirm attempts.
- Retain an audit trail of review status and corrections where practical.

## 9. Proposed REST endpoints (adjust names consistently)
Authentication:
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
Receipts:
- `POST /api/receipts/upload` (multipart, protected)
- `POST /api/receipts/manual`
- `GET /api/receipts?month=&merchant=&status=&page=`
- `GET /api/receipts/:id`
- `GET /api/receipts/:id/ocr-status`
- `PATCH /api/receipts/:id/review`
- `POST /api/receipts/:id/confirm`
- `DELETE /api/receipts/:id`
- `POST /api/receipts/:id/retry-ocr` (bounded attempts)
Products and price history:
- `GET /api/products?q=`, `POST /api/products`, `PATCH /api/products/:id`
- `GET /api/prices/history?productId=&unit=&merchant=`
- `GET /api/prices/compare?productId=`
Budgets:
- `GET /api/budgets?month=`, `PUT /api/budgets/:categoryId/:month`
Reports:
- `GET /api/reports/overview?month=`, `GET /api/reports/categories?month=`, `GET /api/reports/trends?months=`, `GET /api/reports/export.csv?from=&to=`
Settings:
- `GET /api/settings`, `PATCH /api/settings`, `POST /api/account/export`, `DELETE /api/account`

Standard errors: 400 invalid input; 401 unauthenticated; 403 unauthorized; 404 absent or someone else's record (do not reveal ownership); 409 duplicate/conflict; 413 too large; 415 unsupported media; 422 OCR data inconsistent; 429 rate-limited; 500 generic unexpected error. Use a consistent body with `code`, `message` and optional safe `fieldErrors`.

## 10. Security and privacy
- Each database query for user-owned data MUST scope by authenticated userId; assert with API tests that one user cannot view another's receipts/images.
- Set HttpOnly, Secure in production, appropriate SameSite cookies and origin/CSRF protection for state-changing requests. Rate-limit login and uploads.
- Validate actual file content, cap size and decoded pixels, strip EXIF in processed output, enforce private file location outside public frontend root, random safe file names, controlled retention/deletion. No arbitrary URL fetch and no public static exposure of receipt images.
- Do not commit genuine receipts, contact info or scanned payment details. Bundle only synthetic demo fixtures and explicitly label them fictional.
- Support account data export/deletion, and document limitations for retained backups and logs.

## 11. Acceptance criteria for v1
A reviewer can clone the repository, copy `.env.example`, install dependencies, migrate/seed SQLite, and start frontend + backend. With demo credentials created by the seed setup, reviewer can add a manual receipt, upload a sample synthetic image, inspect and correct OCR suggestions, confirm, then find the receipt in dashboard, category totals, and product price history. An imported duplicate raises review warning; invalid image is rejected; tests cover user isolation and arithmetic. README includes screenshots, actual test results, architecture diagram and known limitations.

## 12. Non-goals / honest limits
No guarantees of detecting all OCR fields or all receipt layouts; no automatic retailer price feeds; no claimed “AI accuracy” without real evaluation; no bank integrations or payments; no medical/financial advice; no multi-currency analytics; no promise of production compliance. Treat product as a strong junior-level learning project, not a mature financial services system.

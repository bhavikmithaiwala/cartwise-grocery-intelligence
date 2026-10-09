# Implementation ledger

Baseline: `d74ca3b` (one existing commit). Reference files fully read. Existing untracked `.vscode/` configuration is preserved and excluded from commits.

## Current milestone

1. Monorepo workspace and reference documentation established. Workspace manifests validated.

## Verification

Node 22.13.1 and npm 10.9.2 available. No application tests exist yet.

## Remaining

Roadmap milestones 2â€“50. No application features claimed complete. No push performed.

2. React/TypeScript/Vite frontend scaffold: production build passed (Vite 8.3.4).

3. Express API health endpoint implemented. Workspace type checks and health integration test passed (1 test).

4. Prisma SQLite schema and migration applied; deploy/generate and type checks passed. Initial Windows schema-engine file-creation failure resolved by init-db script. Prisma 6.19 CLI advisories resolved using compatible 6.12 (npm audit: zero vulnerabilities).

5. Responsive shell, navigation and not-found routing implemented. Build initially exposed missing Vite CSS types; fixed, production build passed. Destination screens are explicitly unfinished until their roadmap features land.

6. Accessible reusable fields, notices, badges, cards and buttons added; frontend type check and lint passed.

7. Typed relative API client and Vite proxy configured; both production builds and health test passed. Foundation checkpoint complete.

8. User and hashed session models migrated. Dedicated test SQLite database; hash-only persistence, revocation and expiry verified (2 total tests pass), type checks pass.

9. Registration/login/logout/me endpoints, scrypt password hashing, HttpOnly cookies, session rotation, origin/header protection and auth rate limiting implemented. 3 tests and type checks pass. Lint flagged required Express error-handler argument; configured unused underscore arguments and reran successfully.

10. Shared authenticated user middleware and owner query helper implemented. Expired and forged cookie API tests pass. Type checks and 3 tests pass. Lint completed after the commit and flagged Express global namespace augmentation; corrected in milestone 11. Earlier lint-pass wording was inaccurate.

11. Accessible sign-in and registration forms integrated with the actual API. Type checks, lint, 3 tests and frontend production build passed. Milestone 10 lint issue corrected.

12. Account bootstrap, guarded routes and logout integrated. Both production builds and lint passed; backend auth isolation of session identity tested. Browser smoke pending milestone 46.

13. Receipt, reviewed line and OCR job models migrated, with cascade ownership and indexes. State transition tests prevent direct OCR confirmation. 4 tests and type checks pass.

14. Private random image storage, original-file SHA-256, content/MIME validation, 8 MB/16 MP limits, EXIF stripping and path containment implemented. Image security test, type checks and lint passed.

15. Upload selection/drop UI with client file validation and real byte progress implemented. Frontend production build and lint passed; server upload route is next milestone.

16. Protected upload, receipt details, image and OCR status APIs implemented. Multipart upload test proves two-user isolation and forged-file rejection. Type checks and targeted integration test pass.
Lint flagged stripped hash variable; explicit discard fixed it and lint rerun passed.

17. Single-worker local Tesseract queue, 90-second recognition timeout, safe errors and interrupted-job recovery implemented. Actual local OCR smoke passed on generated fictional receipt (MILK and 7.50 recognized). Type checks and lint passed. First run downloads public English model into private storage/ocr-cache.

18. Deterministic merchant/date/totals parser connected to OCR. Missing-field warnings, decimal comma and possible O/0 correction tests pass; type checks and lint pass.

19. Item-row suggestions preserve raw text and heuristic confidence; totals/payment/discount rows excluded. No-line warning provided. Parser test, type checks and lint passed.

20. OCR polling/review UI provides private image preview, editable headers/lines/quantities/categories/totals and explicit save/confirm controls. Build and lint passed. Persistence routes follow milestones 21–22.

21. Strict integer-cent, decimal quantity, date and reconciliation validation implemented. Test initially caught malformed quantity reaching BigInt; guarded conversion fixed and rerun passed. Type checks and lint passed.

22. Review persistence and atomic idempotent confirmation implemented; original images/OCR suggestions removed after confirmation unless retained. Test caught nullable database fields conflicting with validation; null normalization fixed. Confirmation test, type checks and lint passed.

23. Exact original-file hash and cautious merchant/date/total duplicate warnings implemented, with explicit acknowledgement before confirmation. No silent merge/deletion. Duplicate unit test, type checks and lint passed.

24. Manual entry, draft persistence, private deletion and failed OCR retry (max 3 attempts) completed. Build caught Express DELETE parameter union; normalized parameter fixed and both builds passed. Lint and 10 tests passed. Receipt workflow checkpoint implemented; browser proof remains milestone 46.

25. Owner-scoped paginated receipt listing with month/merchant/status validation, merchant catalog and standard categories implemented. Type checks, lint and upload isolation integration test passed. Merchant identity uses reviewed receipt text rather than a redundant merchant table.

26. Searchable receipt history with month/status/merchant filters, stable pagination and details links completed. Build and lint passed.

27. Owner-scoped canonical product model/API and reviewed line mapping persistence added. No automatic fuzzy mapping. Regression test caught nullable product field; normalized and rerun passed. Migration, type checks and lint passed.

28. Product selection/creation and package-size controls added to review. Mapping is always explicit; unmapped lines excluded from price intelligence. Frontend build and lint passed.

29. Decimal.js normalizes kg/g and L/ml exactly, includes package counts and separates mass/volume/each. Unit prices rounded half-up to 6 decimal cents per base unit; stored money remains integer cents. Unit tests, type checks and lint passed.

30. Confirmed-only observations created in confirmation transaction with unique source line and cascade deletion. Mapped product family enforced. Test verifies normalized observation and idempotent single set. Migration, type checks and lint pass.

31. Owner-scoped historical price API with confirmed-only sources, package details, date/merchant/unit filters and precise price strings implemented. Type checks and lint passed.

32. Product search/date/unit selectors and price history chart/table with source links and honest insufficient-data states implemented. Frontend build and lint passed.

33. Store comparison groups by product and normalized unit, with lowest recorded value/count/date/source implemented. Unit grouping test passed. Frontend syntax error during integration corrected; type checks and lint rerun passed.

34. Monthly category budget schema with owner/category/month uniqueness and validated integer-cent endpoints migrated. Actuals query confirmed reviewed lines only. Migration, type checks and lint passed.

35. Monthly category budget editing, actuals, progress and overspend states connected to API. Frontend build and lint passed.

36. Confirmed-only monthly analytics by local receipt date and integer-cent sums implemented. Category/merchant aggregates, separate tax and unallocated adjustments included. Month-boundary/isolation test, type checks and lint passed.

37. Dashboard cards, category distribution and recent receipts connected to monthly API; all values reflect confirmed data with truthful empty states. Frontend build and lint passed.

38. Six-month spending trend API and reports screen with category/merchant charts as accessible tables implemented; tax and unallocated adjustments visible. Type checks and lint passed.

39. Inclusive from/to receipt search, date-order validation and UI controls added. Boundary/pagination integration test, type checks and lint passed.

40. Safe confirmed CSV export with formula neutralization plus account JSON export, password-verified deletion and retention settings completed. Settings were required in specification but absent from numbered roadmap; included with data management/export milestone. CSV test, type checks and lint passed.

41. Expanded money/quantity normalization tests cover overflow, tiny decimals, invalid precision, half-up rounding and incomplete packages. 4 targeted tests and lint passed.

42. Discounted/taxed, malformed/blurry and unit-mismatch synthetic text/image fixtures added. Parser correction scenarios pass (2 tests), lint passes. Restricted shell tsx generation failed OS-user lookup; elevated rerun generated fixtures successfully.

43. Parallel repeated confirmation test passes with one receipt/observation set; actual identical multipart uploads produce exact duplicate warning and block unacknowledged confirmation. 2 targeted tests and lint pass.

44. Full two-account API lifecycle verifies isolated writes/reporting/products/budgets/exports, account deletion cascade and password checks. Oversized decoded image test added. 2 targeted integration/security tests, lint and type checks passed.

45. React interaction tests prove accessible sign-in error behavior, manual correction and integer-cent form submission. Initial jsdom run failed due backend node:sqlite setup; separate Vitest frontend/backend projects resolved. 2 React tests, lint and type checks passed.

46. Chromium E2E passed (1 test, 10.3s) covering registration/manual correction/confirmation/dashboard and actual local Tesseract review/logout. Real fictional-data screenshots captured. Added managed-server configuration with separate e2e SQLite database for clean runs; type checks and lint passed.

47. GitHub Actions installs dependencies, migrates SQLite, runs lint/type checks/unit+integration+React tests/builds and Chromium E2E with artifact capture. Local equivalent quality gate passed: 17 test files, 21 tests, both builds. Hosted Actions run not yet demonstrated.

48. Architecture, security/privacy/retention decisions, monetary/tax/quantity rules, actual endpoint contracts and evidence-based interview notes documented. Documentation checked against implemented routes; lint passed.

49. Recruiter README, real screenshots, reproducible commands, ninety-second demo and deployment notes prepared; limitations and verified evidence disclosed. Screenshot/doc references validated and both builds passed. Seed/start release verification follows milestone 50.

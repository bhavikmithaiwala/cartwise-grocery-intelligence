# CartWise — Acceptance cases and demo walkthrough

## A. Must-pass demo (one user)
1. Run a clean installation following README, apply migrations and generate fictional seeded test data.
2. Register/log in as demo user. Log out and confirm protected pages redirect.
3. Manually create a grocery receipt with 2 line items, quantities, categories and verified totals. Confirm it.
4. Open dashboard and confirm monthly receipt totals and category spending updated.
5. Upload bundled synthetic sample receipt image. Server validates image and starts actual local OCR. Poll for result. Show uncertain fields, edit them, then confirm.
6. Re-upload exactly the same image. Show duplicate warning; do not silently double count.
7. Open product price history: compare two confirmed recorded observations for equivalent packages. Label source store, date and unit.
8. Add monthly grocery/category budget. Show remaining and overspend progress calculated from confirmed line totals.
9. Export CSV and validate records/headers/currency values; spreadsheet formula-like fields are neutralized.
10. Demonstrate two-user isolation: user B cannot read or download user A's receipt details/image.

## B. Reproducible sample receipts (synthetic only)
Prepare 3–5 deliberately fictional fixtures: a legible receipt, blurry OCR receipt, discounted/taxed receipt, duplicate re-upload, and quantity/unit mismatch case. Keep synthetic store names, dates, and amounts. Use no real card numbers, addresses, loyalty IDs, or actual personal receipts.

## C. Domain edge cases
- `0`, negative, blank and nonnumeric quantities; `$0.00` legal when explicitly supported; overflow cents.
- OCR text `O.99` mistaken for `0.99`, comma decimal separators, tax lines, total lines mistaken as product rows, coupon/discount lines.
- Totals not matching sum of lines due to tax/discount; warn rather than silently modify.
- Missing purchase date, ambiguous merchant, extra OCR whitespace, multi-line item names.
- Repeated image same hash; same store/date/amount but actually different purchases (possible false positive).
- Double-click and concurrent confirm requests; at most one confirmed receipt/observation set.
- User deletes/discards pending receipt; analytics do not change.
- Unit mismatch 1kg vs 500g can normalize, but 1kg vs one package without defined size must not compare.
- Month boundary in local purchase date: no UTC conversion changing calendar day.
- Browser refresh during processing; status reloaded from API; failed OCR can be retried or entered manually.
- High pixel-count image or forged extension rejected safely.
- User A tries to read/modify user B receipt or uploaded image; return not found/forbidden without exposing data.
- Receipt has zero usable products: allow correction, don't fabricate parsed lines.

## D. Test command expectations
Document root-level commands; expected examples:
```
npm install
npm run db:migrate
npm run db:seed
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```
Names must match actual package scripts. Explain separate backend/frontend commands if necessary. GitHub Actions must exercise supported tests, not skip failing ones.

## E. Evidence checklist for recruiters
- Live demo if deployed; otherwise a short local walkthrough video/GIF (no private data).
- Screenshot of receipt review showing OCR suggestions and manual corrections.
- Screenshot of dashboard with realistic **synthetic** sample data.
- Diagram showing image -> OCR -> parser -> human review -> confirmed data -> analytics.
- Table listing backend endpoints and sample request/response contracts.
- At least three tests highlighted: money precision, duplicate protection, user isolation.
- Brief engineering decisions: why SQLite, why human confirmation, how unit normalization works, what the OCR system cannot reliably do.
- Honest limitation note: no live retailer feeds; prices from user receipts only; OCR isn't perfect.

# CartWise — Interview study notes and questions

**Use these as prompts to learn the code you actually implement, not as claims about features that do not yet exist.** After building each phase, replace example wording with evidence from your actual files, tests, and demo.

## 30-second explanation
“CartWise is a full-stack grocery receipt and price-history application. The frontend lets people upload receipts and correct OCR suggestions before confirming them. A Node.js API stores verified purchases, and SQLite keeps receipts, line items, budgets and historical prices. The interesting parts are handling imperfect OCR, keeping money calculations accurate, identifying duplicate receipts and comparing prices only when units are equivalent.”

## Architecture: likely questions and answer directions
**1. Why React + Node.js + SQLite?** React for component-driven forms and dashboards; Express keeps parsing/auth/reporting server-side; SQLite offers relational constraints, migrations and easy local reproducibility for a junior portfolio demo. Explain how this could evolve to Postgres if concurrent writes grew.

**2. Why is OCR done on the server?** Keeps parsing consistent and isolates heavy OCR work, while browser UI can poll job status. Trade-off: CPU usage, upload security, file retention. A browser-only OCR model is another choice, but architecture must be consistent.

**3. What happens from upload to dashboard?** Image validation -> private storage -> OCR job -> OCR raw text -> parser suggestions -> human review -> transactional confirmation -> line/product price observations -> dashboard queries. Be able to point to actual files.

**4. Why require review?** OCR can confuse prices, totals, quantity and merchant names; incorrect automatic imports would make budgets and history misleading. Show actual review screen and a synthetic corrupted receipt test.

**5. What does confidence mean?** A heuristic from parser/engine used to direct review, not calibrated probability of correctness. Do not invent accuracy benchmarks.

## Financial correctness
**6. Why store integer cents?** `0.1 + 0.2` is not reliably exact as a binary floating-point money amount. Parse decimal currency strings and store cents. Distinguish decimal quantities from cents.

**7. How do you handle 1.5 kg bought by weight?** Store precise quantity string/decimal, line total in cents, normalize kg to g for unit comparisons, define rounding. Do not multiply prices using floats without a decimal library.

**8. What if OCR lines do not add up to the total?** Show a discrepancy and require user action/explicit documented override; taxes, promotions and errors may explain differences. Never silently adjust totals.

**9. Are dashboard and budget totals the same?** Not necessarily. Receipt totals may include tax while budgets can be based on category-allocated product line totals. Show exactly how your implemented policy works.

**10. How do you prevent a duplicate import?** SHA-256 exact same file as an immediate signal; merchant/date/total as a nonbinding suggestion; unique confirmation/idempotency guards; explain false positives and crops of same image.

## Product price intelligence
**11. Does CartWise compare live Walmart/Loblaws prices?** No. It compares historical user-uploaded observations and labels store/date. Do not imply live prices unless such a feature actually exists.

**12. How do you know two products are the same?** Normalized labels create suggestions, but user-reviewed canonical mappings avoid wrong merges. Compare package size and compatible normalized units.

**13. Why not compare a 500g pack with a 1kg pack using their sticker prices?** Sticker prices aren't directly comparable. Normalize to cents per g/kg when quantities are known, and separate each-only products that lack compatible size data.

**14. What if a store uses abbreviations on receipts?** Keep the raw description, propose a canonical item, and let users correct it; maintain mapping choices for future receipts without assuming perfect identity.

## Backend, privacy and reliability
**15. How do you prevent users reading each other's receipts?** Every query scopes by authenticated user ID, including OCR jobs and images. Use integration tests with two independent users.

**16. How do you validate uploads?** Content type and file magic, size, pixel dimensions, safe generated file names, private storage outside static public, no fetch of arbitrary submitted URLs.

**17. How does OCR run without blocking requests?** A bounded worker and job-status API. A single-process local queue has known restart limitations; explain them and possible durable queue upgrade later.

**18. How do you avoid double confirmation?** Guard valid status transitions and perform confirmation plus observation creation transactionally/idempotently; test parallel requests.

**19. What happens if OCR fails?** Show failed state, allow bounded retry or manual entry; never mark the receipt confirmed automatically.

**20. What's the privacy policy for images?** Clearly state retention, protect images per user, minimize stored OCR text, delete discarded images as defined, never log sensitive receipt content. Demonstrate settings and tests.

## Testing and debugging
**21. Which tests are most valuable?** Money/rounding, parser edge cases, duplicate detection, two-user isolation, receipt confirm flow, unit normalization, and an E2E synthetic receipt demo.

**22. How do you test OCR reliably?** Unit tests operate on stored synthetic OCR text for deterministic parsing; keep at least one smoke test using real synthetic receipt image with the OCR adapter.

**23. How would you debug a wrong monthly chart?** Check confirmed-only filtering, receipt's local purchase date, tax/category policy, price lines and timezone boundary; reproduce with fixture and test calculation service.

**24. How would you improve performance?** Add indexes on user/date/merchant/product and paginate receipts; avoid running OCR on API request thread; inspect actual query plans before optimization.

**25. What trade-offs did you make?** SQLite over hosted database for easy local demo, local OCR over paid API, user review over risky automation, and monolith over microservices at this scale.

## Five honest demonstration scripts
1. **Core:** register, manually add receipt, verify dashboard.
2. **OCR:** upload synthetic image with one intentionally wrong line, correct it, confirm.
3. **Duplicate:** upload identical image twice, show warning and explain false positives.
4. **Prices:** show an apples-to-apples normalized comparison and a mismatched unit not compared.
5. **Security:** sign in as a second user and demonstrate that receipt details from user one cannot be loaded.

## Questions to ask yourself before putting it on the resume
- Can I point to the route and service implementing every bullet?
- Can I explain the table relationships and the source of every chart number?
- Can I reproduce the duplicate/rounding/authorization tests myself?
- Do I know which receipt fields are OCR guesses and which are reviewed?
- Have I removed unimplemented claims and unrealistic performance numbers?

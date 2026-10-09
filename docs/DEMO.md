# Verified demo walkthrough

All accounts, receipt images and prices shown are fictional. Screenshots were captured by real Chromium from the running app, including actual Tesseract processing.

## Ninety seconds

1. **0–15s:** Sign in and open the dashboard. Show the current reporting month and explain that only confirmed receipts count. Mention CAD integer cents.
2. **15–35s:** Open Upload, choose `backend/fixtures/legible-fictional.png`, and watch upload then OCR status. Explain that OCR is local and its values remain suggestions.
3. **35–55s:** Correct a line, check totals and explicitly map a product/package if appropriate. Save reviewed changes and confirm. The dashboard now includes the verified purchase.
4. **55–70s:** Open Prices. Choose a seeded product and compare historical observations with date, merchant, normalized unit and source receipt. Explain there are no live retail prices.
5. **70–85s:** Open Budgets and Reports. Show category actuals excluding receipt tax, monthly trend and CSV export. Re-upload the image to show a duplicate warning without another automatic import.
6. **85–90s:** Mention the two-user isolation, precision and parallel-confirmation tests. Show Settings retention controls and explain OCR limitations honestly.

For a fast demo, use seeded data and pre-upload the synthetic scan, while still showing the actual OCR status/review flow. Do not claim the queue is instantaneous.

## Reproducible evidence

`npm run test:e2e` proves registration → manual draft → correction → explicit confirmation → dashboard, then upload → actual OCR → correction → confirmation → logout. Screenshots are written to `docs/screenshots/dashboard.png` and `review.png`.

`npm test` includes backend API lifecycle coverage for two-account writes, analytics, products, budgets, CSV/JSON export and account deletion. `backend/src/uploads.test.ts` verifies private image/status isolation and identical upload warning. Parser fixtures include a discounted/taxed receipt, blurry/malformed text and an incompatible-unit case.

Confirmed receipts cannot be edited in place. Delete and re-enter to correct a verified purchase, ensuring its old observations no longer affect reports. This is an intentional v1 correction policy.

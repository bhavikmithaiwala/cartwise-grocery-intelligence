# REST API

All routes use `/api`. JSON writes include `Content-Type: application/json` and `X-CartWise-Request: 1`; send the session cookie. Browser requests must use the configured `APP_ORIGIN`. Multipart uploads use the same protection header. Data access requires authentication except auth/register, auth/login and health.

| Method/path | Request | Response |
| --- | --- | --- |
| GET /health | none | status/service/currency |
| POST /auth/register, /auth/login | email, password (10–128 characters) | id/email plus session cookie |
| GET /auth/me | none | authenticated id/email |
| POST /auth/logout | `{}` | 204; session revoked |
| POST /receipts/upload | multipart `image` | 202 id/status |
| POST /receipts/manual | reviewed receipt below | 201 reviewed draft |
| GET /receipts | month, from, to, merchant, status, page | items/total/page/pageSize (20) |
| GET /receipts/:id | none | receipt, lines, suggestions, duplicate warnings; no storage paths/hash |
| GET /receipts/:id/image | none | private PNG or 404 |
| GET /receipts/:id/ocr-status | none | status/job with safe error code |
| PATCH /receipts/:id/review | reviewed receipt | saved draft; does not import |
| POST /receipts/:id/confirm | optional duplicateAcknowledged | atomically confirmed receipt; idempotent |
| POST /receipts/:id/retry-ocr | `{}` | 202 processing (failed only, max three attempts) |
| DELETE /receipts/:id | none | 204; lines/observations removed |
| GET /merchants, /categories | none | reviewed merchant labels / standard categories |
| GET /products | optional q | owner canonical products (up to 200) |
| POST /products | name, unitFamily (mass/volume/each) | canonical product |
| GET /prices/history | productId; optional unit/merchant/from/to | observations with precise centsPerUnit and sourceReceiptId (up to 1000) |
| GET /prices/compare | productId | lowest historical observations by merchant/unit |
| GET /budgets | month | category limits/spending |
| PUT /budgets/:category/:month | integer limitCents | upserted budget |
| GET /reports/overview | month | confirmed totals/categories/merchants/recent receipts |
| GET /reports/trends | month, months (1–24) | monthly receipt spending |
| GET /reports/export.csv | from, to | confirmed CSV, integer-cent columns |
| GET/PATCH /settings | PATCH: retainImages boolean | retention preference |
| POST /account/export | `{}` | private account JSON without credentials/storage/OCR text |
| DELETE /account | password | 204; account data/images removed |

Example reviewed receipt (CAD only):

```json
{
  "merchant": "Fictional Market",
  "purchaseDate": "2026-10-09",
  "subtotalCents": 450,
  "taxCents": 0,
  "totalCents": 450,
  "correctionNote": "",
  "lines": [{
    "description": "Milk", "rawText": "MILK 4.50", "category": "Dairy",
    "quantityDecimal": "1", "quantityUnit": "each", "lineTotalCents": 450,
    "packageSizeDecimal": "1", "packageUnit": "l"
  }]
}
```

Optional `productId` must belong to the current account. Setting it explicitly makes this line eligible for price history after confirmation. Missing OCR values remain suggestions until corrected. Raw suggestion confidence is heuristic.

Errors have `{code, message, fieldErrors?}`. Common statuses: 400 invalid input, 401 unauthenticated/invalid credentials, 403 origin/CSRF rejection, 404 missing or foreign record, 409 state/duplicate conflict, 413 oversized upload, 415 invalid image, 422 reconciliation/mapping failure, 429 rate limited, 500 generic failure. No internal exception or sensitive OCR content is returned in error messages.

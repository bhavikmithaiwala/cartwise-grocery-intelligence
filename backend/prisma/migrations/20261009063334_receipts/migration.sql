-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rawMerchant" TEXT NOT NULL DEFAULT '',
    "purchaseDate" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "status" TEXT NOT NULL DEFAULT 'needs_review',
    "subtotalCents" INTEGER NOT NULL DEFAULT 0,
    "taxCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL DEFAULT 0,
    "fileSha256" TEXT,
    "imagePath" TEXT,
    "suggestions" TEXT NOT NULL DEFAULT '{}',
    "correctionNote" TEXT NOT NULL DEFAULT '',
    "confirmedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReceiptLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Other',
    "quantityDecimal" TEXT NOT NULL DEFAULT '1',
    "quantityUnit" TEXT NOT NULL DEFAULT 'each',
    "packageSizeDecimal" TEXT,
    "packageUnit" TEXT,
    "lineTotalCents" INTEGER NOT NULL,
    "parserConfidence" REAL,
    "reviewedByUser" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OcrJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "safeErrorCode" TEXT,
    CONSTRAINT "OcrJob_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Receipt_userId_purchaseDate_status_idx" ON "Receipt"("userId", "purchaseDate", "status");

-- CreateIndex
CREATE INDEX "Receipt_userId_fileSha256_idx" ON "Receipt"("userId", "fileSha256");

-- CreateIndex
CREATE INDEX "ReceiptLine_receiptId_idx" ON "ReceiptLine"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "OcrJob_receiptId_key" ON "OcrJob"("receiptId");

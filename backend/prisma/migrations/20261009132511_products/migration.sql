-- CreateTable
CREATE TABLE "CanonicalProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitFamily" TEXT NOT NULL,
    CONSTRAINT "CanonicalProduct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReceiptLine" (
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
    "productId" TEXT,
    CONSTRAINT "ReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReceiptLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CanonicalProduct" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReceiptLine" ("category", "description", "id", "lineTotalCents", "packageSizeDecimal", "packageUnit", "parserConfidence", "quantityDecimal", "quantityUnit", "rawText", "receiptId", "reviewedByUser") SELECT "category", "description", "id", "lineTotalCents", "packageSizeDecimal", "packageUnit", "parserConfidence", "quantityDecimal", "quantityUnit", "rawText", "receiptId", "reviewedByUser" FROM "ReceiptLine";
DROP TABLE "ReceiptLine";
ALTER TABLE "new_ReceiptLine" RENAME TO "ReceiptLine";
CREATE INDEX "ReceiptLine_receiptId_idx" ON "ReceiptLine"("receiptId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CanonicalProduct_userId_name_unitFamily_key" ON "CanonicalProduct"("userId", "name", "unitFamily");

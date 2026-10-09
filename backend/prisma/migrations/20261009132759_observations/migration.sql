-- CreateTable
CREATE TABLE "PriceObservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "normalizedQuantityDecimal" TEXT NOT NULL,
    "normalizedUnit" TEXT NOT NULL,
    "lineTotalCents" INTEGER NOT NULL,
    CONSTRAINT "PriceObservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceObservation_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceObservation_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "ReceiptLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PriceObservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CanonicalProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PriceObservation_lineId_key" ON "PriceObservation"("lineId");

-- CreateIndex
CREATE INDEX "PriceObservation_userId_productId_purchaseDate_idx" ON "PriceObservation"("userId", "productId", "purchaseDate");

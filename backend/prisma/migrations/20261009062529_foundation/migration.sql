-- CreateTable
CREATE TABLE "AppMetadata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1
);

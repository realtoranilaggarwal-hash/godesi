CREATE TABLE "PoojaBooking" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "package" TEXT NOT NULL,
  "priceUsd" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "sankalp" TEXT,
  "preferredDate" TIMESTAMP,
  "address" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);
CREATE INDEX "PoojaBooking_status_createdAt_idx" ON "PoojaBooking" ("status", "createdAt");

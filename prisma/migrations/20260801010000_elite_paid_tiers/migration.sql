-- Elite paid tiers: interview fee, professional film, placement boosts and awards.
ALTER TABLE "EliteEntry"
  ADD COLUMN "awards" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "awardTitle" TEXT,
  ADD COLUMN "awardYear" INTEGER,
  ADD COLUMN "interviewPaid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "videoPackage" TEXT NOT NULL DEFAULT 'NONE',
  ADD COLUMN "paidCents" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "EliteOrder" (
  "id" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "AdOrderStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'stripe',
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EliteOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EliteOrder_reference_key" ON "EliteOrder"("reference");
CREATE INDEX "EliteOrder_entryId_idx" ON "EliteOrder"("entryId");
CREATE INDEX "EliteOrder_userId_idx" ON "EliteOrder"("userId");

ALTER TABLE "EliteOrder"
  ADD CONSTRAINT "EliteOrder_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "EliteEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "EliteOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Where a staff-compiled Elite profile's facts came from.
ALTER TABLE "EliteEntry" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "EliteEntry" ADD COLUMN "sourceName" TEXT;
CREATE UNIQUE INDEX "EliteEntry_sourceUrl_key" ON "EliteEntry"("sourceUrl");

-- Somebody asking to take over a compiled profile.
CREATE TABLE "EliteClaim" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EliteClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EliteClaim_entryId_userId_key" ON "EliteClaim"("entryId", "userId");
CREATE INDEX "EliteClaim_status_idx" ON "EliteClaim"("status");

ALTER TABLE "EliteClaim" ADD CONSTRAINT "EliteClaim_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "EliteEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EliteClaim" ADD CONSTRAINT "EliteClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

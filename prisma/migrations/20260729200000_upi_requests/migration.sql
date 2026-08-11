CREATE TYPE "UpiRequestStatus" AS ENUM ('PENDING', 'PAID', 'REJECTED');

CREATE TABLE "UpiRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "Plan" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "reference" TEXT NOT NULL,
    "utr" TEXT,
    "status" "UpiRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UpiRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UpiRequest_reference_key" ON "UpiRequest"("reference");
CREATE INDEX "UpiRequest_status_createdAt_idx" ON "UpiRequest"("status", "createdAt");

ALTER TABLE "UpiRequest" ADD CONSTRAINT "UpiRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Scratch & win: vendor gifts and member scratch cards
ALTER TYPE "PointsReason" ADD VALUE 'SCRATCH_WIN';

CREATE TYPE "GiftClaim" AS ENUM ('VISIT_STORE', 'VISIT_WEBSITE', 'POST_REVIEW');

CREATE TABLE "ScratchGift" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "claimHow" "GiftClaim" NOT NULL DEFAULT 'VISIT_STORE',
    "quantity" INTEGER NOT NULL,
    "wonCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScratchGift_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ScratchCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "prize" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "giftId" TEXT,
    "code" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScratchCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScratchGift_active_expiresAt_idx" ON "ScratchGift"("active", "expiresAt");
CREATE INDEX "ScratchGift_businessId_idx" ON "ScratchGift"("businessId");
CREATE UNIQUE INDEX "ScratchCard_code_key" ON "ScratchCard"("code");
CREATE INDEX "ScratchCard_userId_createdAt_idx" ON "ScratchCard"("userId", "createdAt");
CREATE INDEX "ScratchCard_giftId_idx" ON "ScratchCard"("giftId");

ALTER TABLE "ScratchGift" ADD CONSTRAINT "ScratchGift_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScratchCard" ADD CONSTRAINT "ScratchCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScratchCard" ADD CONSTRAINT "ScratchCard_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "ScratchGift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

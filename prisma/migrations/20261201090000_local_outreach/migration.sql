-- CreateTable
CREATE TABLE "LocalOutreach" (
    "id" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "businessIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "step" INTEGER NOT NULL DEFAULT 0,
    "firstSentAt" TIMESTAMP(3),
    "lastSentAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "stopReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalOutreach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalOutreach_campaign_email_key" ON "LocalOutreach"("campaign", "email");

-- CreateIndex
CREATE INDEX "LocalOutreach_campaign_stoppedAt_idx" ON "LocalOutreach"("campaign", "stoppedAt");

-- AlterTable
ALTER TABLE "Business" ADD COLUMN "featurePaymentRefs" TEXT[] DEFAULT ARRAY[]::TEXT[];

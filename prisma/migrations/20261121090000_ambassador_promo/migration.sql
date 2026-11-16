-- AlterTable
ALTER TABLE "Ambassador" ADD COLUMN     "businessApprovedAt" TIMESTAMP(3),
ADD COLUMN     "businessInfo" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "socialUrl" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "ambassadorId" TEXT,
ADD COLUMN     "promoCode" TEXT;

-- CreateTable
CREATE TABLE "AmbassadorPromoEvent" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ambassadorId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "benefit" TEXT,
    "eligibility" TEXT,
    "rewardTickets" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbassadorPromoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AmbassadorClick" (
    "id" TEXT NOT NULL,
    "promoEventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmbassadorClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AmbassadorPromoEvent_code_key" ON "AmbassadorPromoEvent"("code");

-- CreateIndex
CREATE INDEX "AmbassadorPromoEvent_eventId_idx" ON "AmbassadorPromoEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "AmbassadorPromoEvent_ambassadorId_eventId_key" ON "AmbassadorPromoEvent"("ambassadorId", "eventId");

-- CreateIndex
CREATE INDEX "AmbassadorClick_promoEventId_createdAt_idx" ON "AmbassadorClick"("promoEventId", "createdAt");

-- CreateIndex
CREATE INDEX "AmbassadorClick_eventId_idx" ON "AmbassadorClick"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Ambassador_promoCode_key" ON "Ambassador"("promoCode");

-- CreateIndex
CREATE INDEX "Ticket_ambassadorId_idx" ON "Ticket"("ambassadorId");

-- CreateIndex
CREATE INDEX "Ticket_promoCode_idx" ON "Ticket"("promoCode");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "Ambassador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorPromoEvent" ADD CONSTRAINT "AmbassadorPromoEvent_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "Ambassador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorPromoEvent" ADD CONSTRAINT "AmbassadorPromoEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AmbassadorClick" ADD CONSTRAINT "AmbassadorClick_promoEventId_fkey" FOREIGN KEY ("promoEventId") REFERENCES "AmbassadorPromoEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Existing approved ambassadors get their personal code.
UPDATE "Ambassador" SET "promoCode" = 'GD-' || "certificateNo"
WHERE "status" = 'APPROVED' AND "certificateNo" IS NOT NULL AND "promoCode" IS NULL;

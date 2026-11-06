-- AlterTable
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "sponsorsEvents" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventSponsor" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "message" TEXT,
    "offer" TEXT,
    "couponId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSponsor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventSponsor_couponId_key" ON "EventSponsor"("couponId");
CREATE INDEX IF NOT EXISTS "EventSponsor_eventId_status_idx" ON "EventSponsor"("eventId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "EventSponsor_eventId_businessId_key" ON "EventSponsor"("eventId", "businessId");

ALTER TABLE "EventSponsor" ADD CONSTRAINT "EventSponsor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventSponsor" ADD CONSTRAINT "EventSponsor_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventSponsor" ADD CONSTRAINT "EventSponsor_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

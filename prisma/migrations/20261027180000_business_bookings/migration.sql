-- Business booking feature: opt-in fields on cards + escrowed deposit bookings.
ALTER TABLE "Business"
  ADD COLUMN "bookingsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "bookingPriceMinor" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "bookingDepositPct" INTEGER NOT NULL DEFAULT 20;

CREATE TYPE "BookingStatus" AS ENUM ('AWAITING_PAYMENT', 'PENDING', 'CONFIRMED', 'DECLINED', 'EXPIRED', 'CANCELLED');

CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "bookerName" TEXT NOT NULL,
    "bookerEmail" TEXT NOT NULL,
    "bookerPhone" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventType" TEXT,
    "guestCount" INTEGER,
    "notes" TEXT,
    "priceMinor" INTEGER NOT NULL,
    "depositMinor" INTEGER NOT NULL,
    "feeMinor" INTEGER NOT NULL,
    "payoutMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "BookingStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "stripeRefundId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_stripeSessionId_key" ON "Booking"("stripeSessionId");
CREATE INDEX "Booking_businessId_status_idx" ON "Booking"("businessId", "status");
CREATE INDEX "Booking_status_expiresAt_idx" ON "Booking"("status", "expiresAt");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

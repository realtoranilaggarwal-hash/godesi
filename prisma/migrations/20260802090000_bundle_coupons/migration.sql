-- Caller codes can add months instead of (or as well as) money off.
ALTER TABLE "Coupon" ADD COLUMN "bonusMonths" INTEGER NOT NULL DEFAULT 0;

-- The all-in-one yearly package is its own coupon scope.
ALTER TYPE "CouponScope" ADD VALUE 'BUNDLE';

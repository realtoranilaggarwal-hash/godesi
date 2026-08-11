ALTER TABLE "Business" ADD COLUMN "serviceOptions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Business" ADD COLUMN "priceFrom" TEXT;
ALTER TABLE "Business" ADD COLUMN "priceHourly" TEXT;
ALTER TABLE "Business" ADD COLUMN "priceExtra" TEXT;
ALTER TABLE "Business" ADD COLUMN "availability" TEXT;
ALTER TABLE "Business" ADD COLUMN "licenseDocUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "verifiedProvider" BOOLEAN NOT NULL DEFAULT false;

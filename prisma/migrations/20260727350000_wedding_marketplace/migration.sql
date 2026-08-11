-- Wedding marketplace: vendor pricing, package inclusions, requirement dates
-- and named resource-link rails.
ALTER TABLE "Business" ADD COLUMN "startingPrice" INTEGER;
ALTER TABLE "Business" ADD COLUMN "priceCurrency" TEXT;
ALTER TABLE "Business" ADD COLUMN "customQuote" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "VendorPackage" ADD COLUMN "includes" TEXT;

ALTER TABLE "Lead" ADD COLUMN "eventDate" TIMESTAMP(3);

ALTER TABLE "ResourceLink" ADD COLUMN "placement" TEXT;

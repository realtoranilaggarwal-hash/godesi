-- US property listing fields: lot size, half baths, year built, HOA and tax,
-- open house window, school district, MLS number and the checkbox taxonomies.
ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "lotSize" INTEGER,
  ADD COLUMN IF NOT EXISTS "lotUnit" TEXT,
  ADD COLUMN IF NOT EXISTS "threeQuarterBaths" INTEGER,
  ADD COLUMN IF NOT EXISTS "halfBaths" INTEGER,
  ADD COLUMN IF NOT EXISTS "yearBuilt" INTEGER,
  ADD COLUMN IF NOT EXISTS "saleType" TEXT,
  ADD COLUMN IF NOT EXISTS "construction" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "flooring" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "parkingTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "hoaFee" INTEGER,
  ADD COLUMN IF NOT EXISTS "propertyTax" INTEGER,
  ADD COLUMN IF NOT EXISTS "openHouseAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "openHouseEndsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "schoolDistrict" TEXT,
  ADD COLUMN IF NOT EXISTS "mlsNumber" TEXT;

-- Buyers sort on an upcoming open house and on size, so both are indexed.
CREATE INDEX IF NOT EXISTS "Listing_openHouseAt_idx" ON "Listing" ("openHouseAt");
CREATE INDEX IF NOT EXISTS "Listing_builtUpArea_idx" ON "Listing" ("builtUpArea");

CREATE TYPE "EventPartnerStatus" AS ENUM ('NONE', 'REQUESTED', 'APPROVED', 'REJECTED');

CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT,
    "address" TEXT,
    "mapsUrl" TEXT,
    "halls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Venue_name_city_key" ON "Venue"("name", "city");
CREATE INDEX "Venue_city_idx" ON "Venue"("city");

ALTER TABLE "EventListing"
  ADD COLUMN "hallName" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "mapsUrl" TEXT,
  ADD COLUMN "venueRefId" TEXT,
  ADD COLUMN "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "partnerStatus" "EventPartnerStatus" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "partnerAgreedAt" TIMESTAMP(3),
  ADD COLUMN "partnerBannerUrl" TEXT,
  ADD COLUMN "partnerStandeeUrl" TEXT,
  ADD COLUMN "partnerSalesUrl" TEXT,
  ADD COLUMN "partnerProofAt" TIMESTAMP(3),
  ADD COLUMN "partnerNote" TEXT;

CREATE INDEX "EventListing_venueRefId_idx" ON "EventListing"("venueRefId");

ALTER TABLE "EventListing"
  ADD CONSTRAINT "EventListing_venueRefId_fkey" FOREIGN KEY ("venueRefId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

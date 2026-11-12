CREATE TABLE IF NOT EXISTS "VenuePhoto" (
  "id" TEXT NOT NULL,
  "venueId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "hall" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VenuePhoto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "VenuePhoto_venueId_sortOrder_idx" ON "VenuePhoto"("venueId", "sortOrder");

DO $$ BEGIN
  ALTER TABLE "VenuePhoto" ADD CONSTRAINT "VenuePhoto_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

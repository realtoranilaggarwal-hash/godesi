-- The Event model maps to the "EventListing" table; the previous migration added the columns to the wrong one.
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "hallCapacity" INTEGER;
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "venueUrl" TEXT;
ALTER TABLE "Event" DROP COLUMN IF EXISTS "hallCapacity";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "venueUrl";

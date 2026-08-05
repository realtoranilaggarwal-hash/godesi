-- The Event model maps to the "EventListing" table; the previous migration added the column to the wrong one.
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "albumUrl" TEXT;
ALTER TABLE "Event" DROP COLUMN IF EXISTS "albumUrl";

-- The Event model maps to "EventListing"; "Event" is the analytics counter table.
ALTER TABLE "Event" DROP COLUMN IF EXISTS "importedFrom";
ALTER TABLE "Event" DROP COLUMN IF EXISTS "claimedAt";

ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "importedFrom" TEXT;
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);

ALTER TABLE "EventClaim" DROP CONSTRAINT IF EXISTS "EventClaim_eventId_fkey";
ALTER TABLE "EventClaim" ADD CONSTRAINT "EventClaim_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

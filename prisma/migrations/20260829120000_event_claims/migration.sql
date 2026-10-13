-- Imported events can be claimed by the real organiser, who then sells tickets here.
ALTER TABLE "Event" ADD COLUMN "importedFrom" TEXT;
ALTER TABLE "Event" ADD COLUMN "claimedAt" TIMESTAMP(3);

CREATE TABLE "EventClaim" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventClaim_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventClaim_eventId_userId_key" ON "EventClaim"("eventId", "userId");
CREATE INDEX "EventClaim_status_idx" ON "EventClaim"("status");

ALTER TABLE "EventClaim" ADD CONSTRAINT "EventClaim_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventClaim" ADD CONSTRAINT "EventClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

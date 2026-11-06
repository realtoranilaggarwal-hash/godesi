-- AlterTable
ALTER TABLE "EventListing" ADD COLUMN IF NOT EXISTS "reviewsAlbumUrl" TEXT;

-- AlterTable
ALTER TABLE "TicketTier" ADD COLUMN IF NOT EXISTS "salesStart" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "salesEnd" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "note" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "EventReview" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "source" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventReview_eventId_hidden_idx" ON "EventReview"("eventId", "hidden");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "EventReview" ADD CONSTRAINT "EventReview_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

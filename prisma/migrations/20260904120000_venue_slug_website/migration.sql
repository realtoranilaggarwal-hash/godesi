-- AlterTable
ALTER TABLE "Venue" ADD COLUMN "slug" TEXT,
ADD COLUMN "website" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Venue_slug_key" ON "Venue"("slug");

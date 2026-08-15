-- CreateEnum
CREATE TYPE "EventSourceKind" AS ENUM ('ICS', 'RSS');

-- AlterTable
ALTER TABLE "EventListing" ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceUid" TEXT;

-- CreateTable
CREATE TABLE "EventSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" "EventSourceKind" NOT NULL DEFAULT 'ICS',
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "websiteUrl" TEXT,
    "categorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventSource_url_key" ON "EventSource"("url");

-- CreateIndex
CREATE UNIQUE INDEX "EventListing_sourceId_sourceUid_key" ON "EventListing"("sourceId", "sourceUid");

-- AddForeignKey
ALTER TABLE "EventListing" ADD CONSTRAINT "EventListing_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "EventSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;


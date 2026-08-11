-- CreateEnum
CREATE TYPE "Faith" AS ENUM ('HINDU_TEMPLE', 'GURUDWARA', 'MOSQUE', 'CHURCH', 'JAIN_TEMPLE', 'BUDDHIST_TEMPLE', 'OTHER');

-- AlterTable
ALTER TABLE "NewsFeed" ADD COLUMN     "topic" TEXT NOT NULL DEFAULT 'general';

-- AlterTable
ALTER TABLE "NewsItem" ADD COLUMN     "topic" TEXT NOT NULL DEFAULT 'general';

-- CreateTable
CREATE TABLE "WorshipPlace" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "faith" "Faith" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "whatsapp" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "source" TEXT NOT NULL DEFAULT 'user',
    "osmId" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedById" TEXT,

    CONSTRAINT "WorshipPlace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorshipImage" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "WorshipImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorshipPlace_slug_key" ON "WorshipPlace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WorshipPlace_osmId_key" ON "WorshipPlace"("osmId");

-- CreateIndex
CREATE INDEX "WorshipPlace_faith_city_idx" ON "WorshipPlace"("faith", "city");

-- CreateIndex
CREATE INDEX "WorshipPlace_status_city_idx" ON "WorshipPlace"("status", "city");

-- CreateIndex
CREATE INDEX "WorshipImage_placeId_idx" ON "WorshipImage"("placeId");

-- CreateIndex
CREATE INDEX "NewsItem_topic_status_publishedAt_idx" ON "NewsItem"("topic", "status", "publishedAt");

-- AddForeignKey
ALTER TABLE "WorshipPlace" ADD CONSTRAINT "WorshipPlace_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorshipImage" ADD CONSTRAINT "WorshipImage_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "WorshipPlace"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "StoreOffer" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "advertiserName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT,
    "promotionType" TEXT,
    "category" TEXT,
    "clickUrl" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreOffer_active_hidden_endsAt_idx" ON "StoreOffer"("active", "hidden", "endsAt");
CREATE UNIQUE INDEX "StoreOffer_source_externalId_key" ON "StoreOffer"("source", "externalId");

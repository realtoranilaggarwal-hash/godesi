-- Member-submitted live radio stations and TV channels, plus not-working reports.
CREATE TYPE "LiveMediaKind" AS ENUM ('RADIO', 'TV');
CREATE TYPE "LiveChannelStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "LiveChannel" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "kind" "LiveMediaKind" NOT NULL,
  "name" TEXT NOT NULL,
  "place" TEXT NOT NULL,
  "about" TEXT,
  "embedId" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "contactName" TEXT,
  "contactPhone" TEXT,
  "contactEmail" TEXT,
  "submittedById" TEXT,
  "status" "LiveChannelStatus" NOT NULL DEFAULT 'PENDING',
  "nonProfit" BOOLEAN NOT NULL DEFAULT false,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "paidUntil" TIMESTAMP(3),
  "adminNote" TEXT,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LiveChannel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LiveChannel_slug_key" ON "LiveChannel"("slug");
CREATE INDEX "LiveChannel_status_kind_featured_idx" ON "LiveChannel"("status", "kind", "featured");

CREATE TABLE "LiveChannelOrder" (
  "id" TEXT NOT NULL,
  "channelId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "months" INTEGER NOT NULL DEFAULT 1,
  "amountMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "AdOrderStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'stripe',
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LiveChannelOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LiveChannelOrder_reference_key" ON "LiveChannelOrder"("reference");
CREATE INDEX "LiveChannelOrder_channelId_idx" ON "LiveChannelOrder"("channelId");
CREATE INDEX "LiveChannelOrder_userId_idx" ON "LiveChannelOrder"("userId");

CREATE TABLE "LiveChannelReport" (
  "id" TEXT NOT NULL,
  "channelKey" TEXT NOT NULL,
  "kind" "LiveMediaKind" NOT NULL,
  "label" TEXT NOT NULL,
  "note" TEXT,
  "userId" TEXT,
  "resolved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LiveChannelReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LiveChannelReport_resolved_createdAt_idx" ON "LiveChannelReport"("resolved", "createdAt");
CREATE INDEX "LiveChannelReport_channelKey_idx" ON "LiveChannelReport"("channelKey");

ALTER TABLE "LiveChannel"
  ADD CONSTRAINT "LiveChannel_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LiveChannelOrder"
  ADD CONSTRAINT "LiveChannelOrder_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "LiveChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "LiveChannelOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LiveChannelReport"
  ADD CONSTRAINT "LiveChannelReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

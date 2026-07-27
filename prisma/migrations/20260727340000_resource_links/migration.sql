CREATE TYPE "ResourceKind" AS ENUM ('AFFILIATE', 'SPONSORED', 'EDITORIAL');

CREATE TABLE "ResourceLink" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "categorySlug" TEXT,
  "tag" TEXT,
  "kind" "ResourceKind" NOT NULL DEFAULT 'SPONSORED',
  "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "impressionCap" INTEGER,
  "submittedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ResourceLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ResourceLink_status_active_categorySlug_idx"
  ON "ResourceLink"("status", "active", "categorySlug");

CREATE TABLE "ResourceOrder" (
  "id" TEXT NOT NULL,
  "linkId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "impressions" INTEGER NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "AdOrderStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'stripe',
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ResourceOrder_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ResourceOrder_reference_key" ON "ResourceOrder"("reference");
CREATE INDEX "ResourceOrder_userId_idx" ON "ResourceOrder"("userId");

ALTER TABLE "ResourceLink" ADD CONSTRAINT "ResourceLink_categorySlug_fkey"
  FOREIGN KEY ("categorySlug") REFERENCES "Category"("slug") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResourceLink" ADD CONSTRAINT "ResourceLink_submittedById_fkey"
  FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResourceOrder" ADD CONSTRAINT "ResourceOrder_linkId_fkey"
  FOREIGN KEY ("linkId") REFERENCES "ResourceLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResourceOrder" ADD CONSTRAINT "ResourceOrder_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

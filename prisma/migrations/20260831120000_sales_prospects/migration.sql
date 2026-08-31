-- Sales prospects: businesses to ring, never published as cards.
CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'CALLED', 'INTERESTED', 'CALL_BACK', 'NOT_INTERESTED', 'WRONG_NUMBER', 'LISTED');

CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "categorySlug" TEXT,
    "subcategorySlug" TEXT,
    "city" TEXT,
    "state" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "websiteUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "ownerId" TEXT,
    "note" TEXT,
    "calledAt" TIMESTAMP(3),
    "listedSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Prospect_sourceUrl_key" ON "Prospect"("sourceUrl");
CREATE INDEX "Prospect_status_categorySlug_idx" ON "Prospect"("status", "categorySlug");
CREATE INDEX "Prospect_ownerId_status_idx" ON "Prospect"("ownerId", "status");
CREATE INDEX "Prospect_city_idx" ON "Prospect"("city");

ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

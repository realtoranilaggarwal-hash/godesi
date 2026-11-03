-- CreateTable
CREATE TABLE "SiteVote" (
    "id" TEXT NOT NULL,
    "siteKey" TEXT NOT NULL,
    "voterHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteVote_siteKey_voterHash_key" ON "SiteVote"("siteKey", "voterHash");

-- CreateIndex
CREATE INDEX "SiteVote_siteKey_idx" ON "SiteVote"("siteKey");

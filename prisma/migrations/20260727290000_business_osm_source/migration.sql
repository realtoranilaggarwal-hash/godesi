ALTER TABLE "Business" ADD COLUMN "source" TEXT;
ALTER TABLE "Business" ADD COLUMN "osmId" TEXT;

CREATE UNIQUE INDEX "Business_osmId_key" ON "Business"("osmId");

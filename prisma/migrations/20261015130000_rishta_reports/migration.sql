-- CreateTable
CREATE TABLE "RishtaReport" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RishtaReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RishtaReport_profileId_idx" ON "RishtaReport"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "RishtaReport_profileId_reporterId_key" ON "RishtaReport"("profileId", "reporterId");

-- AddForeignKey
ALTER TABLE "RishtaReport" ADD CONSTRAINT "RishtaReport_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "RishtaProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RishtaReport" ADD CONSTRAINT "RishtaReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

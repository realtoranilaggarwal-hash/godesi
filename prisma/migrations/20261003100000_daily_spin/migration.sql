-- AlterEnum
ALTER TYPE "PointsReason" ADD VALUE 'DAILY_SPIN';

-- CreateTable
CREATE TABLE "DailySpin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "dealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySpin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailySpin_dealId_idx" ON "DailySpin"("dealId");
CREATE UNIQUE INDEX "DailySpin_userId_day_key" ON "DailySpin"("userId", "day");

-- AddForeignKey
ALTER TABLE "DailySpin" ADD CONSTRAINT "DailySpin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DailySpin" ADD CONSTRAINT "DailySpin_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

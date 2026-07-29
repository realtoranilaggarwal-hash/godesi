-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('AWAITING_PAYMENT', 'PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "hidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hiddenReason" TEXT;

-- CreateTable
CREATE TABLE "ReviewDispute" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "raisedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "feeMinor" INTEGER NOT NULL,
    "feeCurrency" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "paymentRef" TEXT,
    "decisionNote" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewDispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewDispute_reviewId_idx" ON "ReviewDispute"("reviewId");

-- CreateIndex
CREATE INDEX "ReviewDispute_status_idx" ON "ReviewDispute"("status");

-- AddForeignKey
ALTER TABLE "ReviewDispute" ADD CONSTRAINT "ReviewDispute_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewDispute" ADD CONSTRAINT "ReviewDispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


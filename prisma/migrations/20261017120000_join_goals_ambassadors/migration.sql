-- CreateEnum
CREATE TYPE "AmbassadorStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "joinGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "joinGoalsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Ambassador" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT,
    "pitch" TEXT NOT NULL,
    "helps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "signedName" TEXT NOT NULL,
    "pledgedAt" TIMESTAMP(3) NOT NULL,
    "status" "AmbassadorStatus" NOT NULL DEFAULT 'PENDING',
    "certificateNo" INTEGER,
    "approvedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ambassador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ambassador_userId_key" ON "Ambassador"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Ambassador_certificateNo_key" ON "Ambassador"("certificateNo");

-- CreateIndex
CREATE INDEX "Ambassador_status_idx" ON "Ambassador"("status");

-- AddForeignKey
ALTER TABLE "Ambassador" ADD CONSTRAINT "Ambassador_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


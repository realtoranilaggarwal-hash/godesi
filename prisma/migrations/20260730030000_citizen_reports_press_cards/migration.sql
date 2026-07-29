-- CreateEnum
CREATE TYPE "NewsVerdict" AS ENUM ('CONFIRMED', 'DOUBTED', 'FAKE');

-- AlterTable
ALTER TABLE "NewsItem" ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "declaredAt" TIMESTAMP(3),
ADD COLUMN     "happenedAt" TIMESTAMP(3),
ADD COLUMN     "photoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sourceType" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kycNote" TEXT,
ADD COLUMN     "kycVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "pressCardExpiresAt" TIMESTAMP(3),
ADD COLUMN     "pressCardId" TEXT,
ADD COLUMN     "pressCardIssuedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NewsVerification" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verdict" "NewsVerdict" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsVerification_newsId_verdict_idx" ON "NewsVerification"("newsId", "verdict");

-- CreateIndex
CREATE UNIQUE INDEX "NewsVerification_newsId_userId_key" ON "NewsVerification"("newsId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_pressCardId_key" ON "User"("pressCardId");

-- AddForeignKey
ALTER TABLE "NewsVerification" ADD CONSTRAINT "NewsVerification_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "NewsItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsVerification" ADD CONSTRAINT "NewsVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


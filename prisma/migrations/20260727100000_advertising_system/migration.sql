-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdOrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterEnum
ALTER TYPE "BannerSlot" ADD VALUE 'SKYSCRAPER';

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "advertiserId" TEXT,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "startsAt" TIMESTAMP(3),
ADD COLUMN     "status" "BannerStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "position" DROP NOT NULL,
ALTER COLUMN "position" DROP DEFAULT;

-- CreateTable
CREATE TABLE "AdOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannerId" TEXT,
    "slot" "BannerSlot" NOT NULL,
    "months" INTEGER NOT NULL DEFAULT 1,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "reference" TEXT,
    "status" "AdOrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdOrder_reference_key" ON "AdOrder"("reference");

-- CreateIndex
CREATE INDEX "AdOrder_userId_status_idx" ON "AdOrder"("userId", "status");

-- CreateIndex
CREATE INDEX "Banner_advertiserId_idx" ON "Banner"("advertiserId");

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdOrder" ADD CONSTRAINT "AdOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdOrder" ADD CONSTRAINT "AdOrder_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- CreateEnum
CREATE TYPE "VideoOrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "VideoOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "VideoOrderStatus" NOT NULL DEFAULT 'PENDING',
    "businessName" TEXT NOT NULL,
    "script" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "language" TEXT NOT NULL,
    "logoUrl" TEXT,
    "deliveryWhatsapp" TEXT NOT NULL,
    "email" TEXT,
    "priceMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "videoUrl" TEXT,
    "revisionUsed" BOOLEAN NOT NULL DEFAULT false,
    "staffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoOrder_stripeSessionId_key" ON "VideoOrder"("stripeSessionId");

-- CreateIndex
CREATE INDEX "VideoOrder_status_createdAt_idx" ON "VideoOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "VideoOrder_userId_idx" ON "VideoOrder"("userId");

-- AddForeignKey
ALTER TABLE "VideoOrder" ADD CONSTRAINT "VideoOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


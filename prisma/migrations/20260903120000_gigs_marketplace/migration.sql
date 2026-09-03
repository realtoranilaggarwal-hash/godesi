-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('ACTIVE', 'PAUSED', 'REMOVED');

-- CreateEnum
CREATE TYPE "GigOrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED', 'RELEASED', 'DISPUTED', 'REFUNDED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Gig" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "includes" TEXT,
    "priceMinor" INTEGER NOT NULL,
    "deliveryDays" INTEGER NOT NULL DEFAULT 3,
    "status" "GigStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GigOrder" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "GigOrderStatus" NOT NULL DEFAULT 'PENDING',
    "priceMinor" INTEGER NOT NULL,
    "feeMinor" INTEGER NOT NULL,
    "sellerMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "brief" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "stripeRefundId" TEXT,
    "paidAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "autoReleaseAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "disputedAt" TIMESTAMP(3),
    "disputeReason" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GigOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GigMessage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "delivery" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GigMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gig_slug_key" ON "Gig"("slug");

-- CreateIndex
CREATE INDEX "Gig_sellerId_status_idx" ON "Gig"("sellerId", "status");

-- CreateIndex
CREATE INDEX "Gig_status_createdAt_idx" ON "Gig"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GigOrder_stripeSessionId_key" ON "GigOrder"("stripeSessionId");

-- CreateIndex
CREATE INDEX "GigOrder_buyerId_createdAt_idx" ON "GigOrder"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "GigOrder_sellerId_status_idx" ON "GigOrder"("sellerId", "status");

-- CreateIndex
CREATE INDEX "GigOrder_status_autoReleaseAt_idx" ON "GigOrder"("status", "autoReleaseAt");

-- CreateIndex
CREATE INDEX "GigMessage_orderId_createdAt_idx" ON "GigMessage"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigOrder" ADD CONSTRAINT "GigOrder_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigOrder" ADD CONSTRAINT "GigOrder_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigOrder" ADD CONSTRAINT "GigOrder_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigMessage" ADD CONSTRAINT "GigMessage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "GigOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigMessage" ADD CONSTRAINT "GigMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


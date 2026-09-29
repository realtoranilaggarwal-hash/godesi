-- AlterTable
ALTER TABLE "Club" ADD COLUMN "premiumUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClubOrder" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "years" INTEGER NOT NULL DEFAULT 1,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "AdOrderStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubOrder_reference_key" ON "ClubOrder"("reference");
CREATE INDEX "ClubOrder_clubId_idx" ON "ClubOrder"("clubId");
CREATE INDEX "ClubOrder_userId_idx" ON "ClubOrder"("userId");

-- AddForeignKey
ALTER TABLE "ClubOrder" ADD CONSTRAINT "ClubOrder_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubOrder" ADD CONSTRAINT "ClubOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

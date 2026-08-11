-- CreateEnum
CREATE TYPE "SaleSide" AS ENUM ('BUYER', 'SELLER', 'BOTH');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "localKnowledge" INTEGER,
ADD COLUMN     "negotiation" INTEGER,
ADD COLUMN     "processExpertise" INTEGER,
ADD COLUMN     "responsiveness" INTEGER;

-- CreateTable
CREATE TABLE "AgentProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "serviceAreas" TEXT,
    "licenseNumber" TEXT,
    "licenseState" TEXT,
    "designations" TEXT,
    "specialties" TEXT,
    "awards" TEXT,
    "brokerage" TEXT,
    "yearsExperience" INTEGER,
    "transactions" INTEGER,
    "totalSalesMinor" INTEGER,
    "avgPriceMinor" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSale" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "soldOn" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "side" "SaleSide" NOT NULL DEFAULT 'SELLER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentProfile_businessId_key" ON "AgentProfile"("businessId");

-- CreateIndex
CREATE INDEX "AgentSale_profileId_soldOn_idx" ON "AgentSale"("profileId", "soldOn");

-- AddForeignKey
ALTER TABLE "AgentProfile" ADD CONSTRAINT "AgentProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSale" ADD CONSTRAINT "AgentSale_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "AgentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

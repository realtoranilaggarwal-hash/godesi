-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "addedById" TEXT,
ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;


-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('BUSINESS', 'PROFESSIONAL');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "profileType" "ProfileType" NOT NULL DEFAULT 'BUSINESS';

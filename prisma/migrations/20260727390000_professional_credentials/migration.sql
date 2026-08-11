-- Shared professional credential fields (astrologers, consultants, insurance
-- agents, financial advisors, attorneys, real estate agents).
ALTER TABLE "Business" ADD COLUMN "certifications" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Business" ADD COLUMN "licenseNumber" TEXT;
ALTER TABLE "Business" ADD COLUMN "feeStructure" TEXT;
ALTER TABLE "Business" ADD COLUMN "carriers" TEXT;
ALTER TABLE "Business" ADD COLUMN "yearsExperience" INTEGER;

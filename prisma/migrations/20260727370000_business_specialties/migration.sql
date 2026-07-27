-- Sub-services picked from a subcategory checklist (attorney practice areas today).
ALTER TABLE "Business" ADD COLUMN "specialties" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Business" ADD COLUMN "featuredSpecialty" TEXT;

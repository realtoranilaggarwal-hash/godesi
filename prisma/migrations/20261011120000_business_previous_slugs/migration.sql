-- Earlier /business/ page addresses that redirect to the current slug.
ALTER TABLE "Business" ADD COLUMN "previousSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];

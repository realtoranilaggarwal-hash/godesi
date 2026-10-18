-- Review links, Linktree and Alignable pages, shown as buttons on the business card.
ALTER TABLE "Business" ADD COLUMN "googleReviewUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "reviewsUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "linktreeUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "alignableUrl" TEXT;

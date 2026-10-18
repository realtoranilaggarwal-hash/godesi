-- "Write a review" link and a public reviews page, shown as buttons on the business card.
ALTER TABLE "Business" ADD COLUMN "googleReviewUrl" TEXT;
ALTER TABLE "Business" ADD COLUMN "reviewsUrl" TEXT;

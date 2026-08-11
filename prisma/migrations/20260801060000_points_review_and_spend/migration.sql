-- Points for leaving a review, and one point per US dollar spent with Godesi.
ALTER TYPE "PointsReason" ADD VALUE IF NOT EXISTS 'REVIEW_POSTED';
ALTER TYPE "PointsReason" ADD VALUE IF NOT EXISTS 'PAYMENT_SPEND';

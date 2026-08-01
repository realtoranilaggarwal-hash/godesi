-- Only codes marked public are advertised on the upgrade page.
ALTER TABLE "Coupon" ADD COLUMN "publicOffer" BOOLEAN NOT NULL DEFAULT false;

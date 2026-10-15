ALTER TABLE "User" ADD COLUMN "offerContactOk" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "offerContactAt" TIMESTAMP(3);

-- Members who picked topics before the separate opt-in agreed to the old wording, which allowed contact.
UPDATE "User"
SET "offerContactOk" = true, "offerContactAt" = "offerInterestsAt"
WHERE "offerInterestsAt" IS NOT NULL AND cardinality("offerInterests") > 0;

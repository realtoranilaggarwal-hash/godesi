ALTER TABLE "User" ADD COLUMN "onboardingStep" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "User_onboardingStep_createdAt_idx" ON "User"("onboardingStep", "createdAt");
UPDATE "User" SET "onboardingStep" = 4;

ALTER TABLE "User" ADD COLUMN "emailCanonical" TEXT;
ALTER TABLE "User" ADD COLUMN "signupIp" TEXT;
ALTER TABLE "User" ADD COLUMN "bannedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "bannedReason" TEXT;
ALTER TABLE "User" ADD COLUMN "adminNote" TEXT;
ALTER TABLE "User" ADD COLUMN "lastContactedAt" TIMESTAMP(3);

CREATE INDEX "User_emailCanonical_idx" ON "User"("emailCanonical");
CREATE INDEX "User_signupIp_createdAt_idx" ON "User"("signupIp", "createdAt");

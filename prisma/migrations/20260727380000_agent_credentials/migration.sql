-- Extra real estate agent credentials: brokerage detail, licence type, MLS,
-- certifications, languages and an optional licence document.
ALTER TABLE "AgentProfile" ADD COLUMN "brokerageAddress" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "brokerageWebsite" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "licenseType" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "licenseDocUrl" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "mlsId" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "mlsBoard" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "certifications" TEXT;
ALTER TABLE "AgentProfile" ADD COLUMN "languages" TEXT;

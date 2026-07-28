ALTER TABLE "MeetupProfile" ALTER COLUMN "age" DROP NOT NULL;
ALTER TABLE "MeetupProfile" ADD COLUMN "adultConfirmedAt" TIMESTAMP(3);
ALTER TABLE "MeetupProfile" ADD COLUMN "riskAcceptedAt" TIMESTAMP(3);

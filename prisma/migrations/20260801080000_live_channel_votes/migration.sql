-- Community votes for radio stations and TV channels.
CREATE TABLE "LiveChannelVote" (
    "id" TEXT NOT NULL,
    "channelKey" TEXT NOT NULL,
    "kind" "LiveMediaKind" NOT NULL,
    "label" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveChannelVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LiveChannelVote_channelKey_userId_key" ON "LiveChannelVote"("channelKey", "userId");
CREATE INDEX "LiveChannelVote_channelKey_idx" ON "LiveChannelVote"("channelKey");

ALTER TABLE "LiveChannelVote" ADD CONSTRAINT "LiveChannelVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

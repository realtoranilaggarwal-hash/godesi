-- CreateTable
CREATE TABLE "LiveChannelFavorite" (
    "id" TEXT NOT NULL,
    "channelKey" TEXT NOT NULL,
    "kind" "LiveMediaKind" NOT NULL,
    "label" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveChannelFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LiveChannelFavorite_userId_kind_idx" ON "LiveChannelFavorite"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "LiveChannelFavorite_channelKey_userId_key" ON "LiveChannelFavorite"("channelKey", "userId");

-- AddForeignKey
ALTER TABLE "LiveChannelFavorite" ADD CONSTRAINT "LiveChannelFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

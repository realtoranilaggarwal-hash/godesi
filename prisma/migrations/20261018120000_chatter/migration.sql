-- CreateTable
CREATE TABLE "ChatterPost" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "topic" TEXT NOT NULL DEFAULT 'general',
    "city" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentId" TEXT,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "hiddenAt" TIMESTAMP(3),
    "hiddenReason" TEXT,
    "editedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatterPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatterLike" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatterLike_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "ChatterFollow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatterFollow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "ChatterBlock" (
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatterBlock_pkey" PRIMARY KEY ("blockerId","blockedId")
);

-- CreateTable
CREATE TABLE "ChatterReport" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatterReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatterPost_parentId_hiddenAt_createdAt_idx" ON "ChatterPost"("parentId", "hiddenAt", "createdAt");

-- CreateIndex
CREATE INDEX "ChatterPost_authorId_createdAt_idx" ON "ChatterPost"("authorId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatterPost_topic_createdAt_idx" ON "ChatterPost"("topic", "createdAt");

-- CreateIndex
CREATE INDEX "ChatterPost_city_createdAt_idx" ON "ChatterPost"("city", "createdAt");

-- CreateIndex
CREATE INDEX "ChatterLike_userId_idx" ON "ChatterLike"("userId");

-- CreateIndex
CREATE INDEX "ChatterFollow_followingId_idx" ON "ChatterFollow"("followingId");

-- CreateIndex
CREATE INDEX "ChatterBlock_blockedId_idx" ON "ChatterBlock"("blockedId");

-- CreateIndex
CREATE INDEX "ChatterReport_postId_idx" ON "ChatterReport"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatterReport_postId_reporterId_key" ON "ChatterReport"("postId", "reporterId");

-- AddForeignKey
ALTER TABLE "ChatterPost" ADD CONSTRAINT "ChatterPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterPost" ADD CONSTRAINT "ChatterPost_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChatterPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterLike" ADD CONSTRAINT "ChatterLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ChatterPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterLike" ADD CONSTRAINT "ChatterLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterFollow" ADD CONSTRAINT "ChatterFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterFollow" ADD CONSTRAINT "ChatterFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterBlock" ADD CONSTRAINT "ChatterBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterBlock" ADD CONSTRAINT "ChatterBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterReport" ADD CONSTRAINT "ChatterReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ChatterPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatterReport" ADD CONSTRAINT "ChatterReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


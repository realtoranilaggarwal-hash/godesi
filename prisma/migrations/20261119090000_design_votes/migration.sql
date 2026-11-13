-- CreateTable
CREATE TABLE "DesignVote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "comment" TEXT,
    "voterHash" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DesignVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignVote_projectId_idx" ON "DesignVote"("projectId");

-- CreateIndex
CREATE INDEX "DesignVote_projectId_createdAt_idx" ON "DesignVote"("projectId", "createdAt");

-- AddForeignKey
ALTER TABLE "DesignVote" ADD CONSTRAINT "DesignVote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "WebsiteProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

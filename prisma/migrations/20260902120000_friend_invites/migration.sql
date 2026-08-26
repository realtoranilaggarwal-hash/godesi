-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailCanonical" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedUserId" TEXT,
    "joinedAt" TIMESTAMP(3),

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteOptOut" (
    "emailCanonical" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteOptOut_pkey" PRIMARY KEY ("emailCanonical")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invite_joinedUserId_key" ON "Invite"("joinedUserId");

-- CreateIndex
CREATE INDEX "Invite_emailCanonical_idx" ON "Invite"("emailCanonical");

-- CreateIndex
CREATE INDEX "Invite_sentAt_idx" ON "Invite"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_inviterId_emailCanonical_key" ON "Invite"("inviterId", "emailCanonical");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_joinedUserId_fkey" FOREIGN KEY ("joinedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

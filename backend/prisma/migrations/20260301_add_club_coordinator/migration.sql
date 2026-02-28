-- Add clubCoordinator relation to User table
-- CreateTable ClubCoordinator
CREATE TABLE "ClubCoordinator" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubCoordinator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClubCoordinator_clubId_userId_key" ON "ClubCoordinator"("clubId", "userId");

-- CreateIndex
CREATE INDEX "ClubCoordinator_userId_idx" ON "ClubCoordinator"("userId");

-- AddForeignKey
ALTER TABLE "ClubCoordinator" ADD CONSTRAINT "ClubCoordinator_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubCoordinator" ADD CONSTRAINT "ClubCoordinator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

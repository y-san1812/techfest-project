-- DropForeignKey (cleanup old registration dependencies)
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_userId_fkey";
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_eventId_fkey";
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_teamId_fkey";
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_referralId_fkey";
ALTER TABLE "Registration" DROP CONSTRAINT IF EXISTS "Registration_paymentId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Registration_eventId_idx";
DROP INDEX IF EXISTS "Registration_teamId_idx";
DROP INDEX IF EXISTS "Registration_userId_eventId_key";

-- DropTable
DROP TABLE IF EXISTS "Registration";

-- DropForeignKey (update Task foreign keys)
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_eventId_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assigneeId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Task_eventId_idx";
DROP INDEX IF EXISTS "Task_assigneeId_idx";

-- AlterTable Task (remove old columns and add new ones)
ALTER TABLE "Task" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "eventId";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "assigneeId";

-- CreateEnum for TeamJoinRequestStatus
CREATE TYPE "TeamJoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable Club
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- AlterTable Event (add clubId)
ALTER TABLE "Event" ADD COLUMN "clubId" TEXT;

-- CreateIndex on Event.clubId
CREATE INDEX "Event_clubId_idx" ON "Event"("clubId");

-- CreateTable EventFacultyCoordinator
CREATE TABLE "EventFacultyCoordinator" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFacultyCoordinator_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateIndex
CREATE INDEX "EventFacultyCoordinator_userId_idx" ON "EventFacultyCoordinator"("userId");

-- CreateTable TeamJoinRequest
CREATE TABLE "TeamJoinRequest" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TeamJoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamJoinRequest_teamId_userId_key" ON "TeamJoinRequest"("teamId", "userId");
CREATE INDEX "TeamJoinRequest_userId_idx" ON "TeamJoinRequest"("userId");

-- CreateTable TaskAssignment
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssignment_taskId_userId_key" ON "TaskAssignment"("taskId", "userId");
CREATE INDEX "TaskAssignment_userId_idx" ON "TaskAssignment"("userId");

-- Update Team table to add proper index
CREATE INDEX "Team_eventId_idx" ON "Team"("eventId");
CREATE INDEX "Team_teamLeadId_idx" ON "Team"("teamLeadId");

-- Update Task table to add proper index
CREATE INDEX "Task_teamId_idx" ON "Task"("teamId");

-- AddForeignKey Event.clubId
ALTER TABLE "Event" ADD CONSTRAINT "Event_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey EventFacultyCoordinator
ALTER TABLE "EventFacultyCoordinator" ADD CONSTRAINT "EventFacultyCoordinator_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventFacultyCoordinator" ADD CONSTRAINT "EventFacultyCoordinator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey TeamJoinRequest
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamJoinRequest" ADD CONSTRAINT "TeamJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey TaskAssignment
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Referral to remove Registration reference
ALTER TABLE "Referral" DROP CONSTRAINT IF EXISTS "Referral_ownerId_fkey";
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update Payment table (remove old registration references if any)
-- This table now stands alone, no changes needed

-- Update Team foreign keys for cascade
ALTER TABLE "Team" DROP CONSTRAINT IF EXISTS "Team_eventId_fkey";
ALTER TABLE "Team" DROP CONSTRAINT IF EXISTS "Team_teamLeadId_fkey";
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_teamLeadId_fkey" FOREIGN KEY ("teamLeadId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

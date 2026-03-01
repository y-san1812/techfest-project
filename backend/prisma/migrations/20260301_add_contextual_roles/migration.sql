-- CreateTable FacultyCoordinatorRole
CREATE TABLE "FacultyCoordinatorRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacultyCoordinatorRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable TeamLeadRole
CREATE TABLE "TeamLeadRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamLeadRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacultyCoordinatorRole_userId_eventId_key" ON "FacultyCoordinatorRole"("userId", "eventId");

-- CreateIndex
CREATE INDEX "FacultyCoordinatorRole_userId_idx" ON "FacultyCoordinatorRole"("userId");

-- CreateIndex
CREATE INDEX "FacultyCoordinatorRole_eventId_idx" ON "FacultyCoordinatorRole"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLeadRole_userId_teamId_key" ON "TeamLeadRole"("userId", "teamId");

-- CreateIndex
CREATE INDEX "TeamLeadRole_userId_idx" ON "TeamLeadRole"("userId");

-- CreateIndex
CREATE INDEX "TeamLeadRole_teamId_idx" ON "TeamLeadRole"("teamId");

-- AddForeignKey
ALTER TABLE "FacultyCoordinatorRole" ADD CONSTRAINT "FacultyCoordinatorRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyCoordinatorRole" ADD CONSTRAINT "FacultyCoordinatorRole_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLeadRole" ADD CONSTRAINT "TeamLeadRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamLeadRole" ADD CONSTRAINT "TeamLeadRole_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

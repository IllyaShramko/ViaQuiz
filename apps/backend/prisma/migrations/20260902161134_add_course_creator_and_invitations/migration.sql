/*
  Warnings:

  - Added the required column `creatorId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
DROP TYPE IF EXISTS "CourseInvitationStatus";
CREATE TYPE "CourseInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "creatorId" INTEGER;
UPDATE "Course" SET "creatorId" = "teacherId" WHERE "creatorId" IS NULL;
ALTER TABLE "Course" ALTER COLUMN "creatorId" SET NOT NULL;

-- CreateTable
CREATE TABLE "CourseInvitation" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER,
    "invitedEmail" TEXT,
    "invitedLogin" TEXT,
    "status" "CourseInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseInvitation_uuid_key" ON "CourseInvitation"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "CourseInvitation_token_key" ON "CourseInvitation"("token");

-- CreateIndex
CREATE INDEX "CourseInvitation_courseId_idx" ON "CourseInvitation"("courseId");

-- CreateIndex
CREATE INDEX "CourseInvitation_receiverId_idx" ON "CourseInvitation"("receiverId");

-- CreateIndex
CREATE INDEX "CourseInvitation_senderId_idx" ON "CourseInvitation"("senderId");

-- CreateIndex
CREATE INDEX "CourseInvitation_token_idx" ON "CourseInvitation"("token");

-- CreateIndex
CREATE INDEX "CourseInvitation_status_idx" ON "CourseInvitation"("status");

-- CreateIndex
CREATE INDEX "Course_creatorId_idx" ON "Course"("creatorId");

-- CreateIndex
CREATE INDEX "Room_classroomId_idx" ON "Room"("classroomId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInvitation" ADD CONSTRAINT "CourseInvitation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInvitation" ADD CONSTRAINT "CourseInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseInvitation" ADD CONSTRAINT "CourseInvitation_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

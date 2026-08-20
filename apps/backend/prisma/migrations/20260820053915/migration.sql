/*
  Warnings:

  - Added the required column `nickname` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_studentId_fkey";

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "nickname" TEXT NOT NULL,
ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "QuizLike" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizView" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuizLike_userId_createdAt_idx" ON "QuizLike"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "QuizLike_quizId_idx" ON "QuizLike"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizLike_userId_quizId_key" ON "QuizLike"("userId", "quizId");

-- CreateIndex
CREATE INDEX "QuizView_quizId_idx" ON "QuizView"("quizId");

-- CreateIndex
CREATE INDEX "QuizView_userId_idx" ON "QuizView"("userId");

-- CreateIndex
CREATE INDEX "QuizView_quizId_createdAt_idx" ON "QuizView"("quizId", "createdAt");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizLike" ADD CONSTRAINT "QuizLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizLike" ADD CONSTRAINT "QuizLike_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizView" ADD CONSTRAINT "QuizView_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizView" ADD CONSTRAINT "QuizView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

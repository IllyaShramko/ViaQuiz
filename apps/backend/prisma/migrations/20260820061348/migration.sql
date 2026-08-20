/*
  Warnings:

  - A unique constraint covering the columns `[userId,quizId]` on the table `QuizView` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "QuizView_quizId_createdAt_idx";

-- CreateIndex
CREATE UNIQUE INDEX "QuizView_userId_quizId_key" ON "QuizView"("userId", "quizId");

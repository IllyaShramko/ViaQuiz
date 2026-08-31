-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "questionId" INTEGER,
ALTER COLUMN "variantId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

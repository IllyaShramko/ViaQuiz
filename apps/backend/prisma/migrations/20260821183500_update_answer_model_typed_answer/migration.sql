-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT IF EXISTS "Answer_variantId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Answer_variantId_idx";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN IF EXISTS "variantId",
ADD COLUMN IF NOT EXISTS "scoreEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "typedAnswer" TEXT,
ALTER COLUMN "questionId" SET NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "AnswerVariant" (
    "answerId" INTEGER NOT NULL,
    "variantId" INTEGER NOT NULL,

    CONSTRAINT "AnswerVariant_pkey" PRIMARY KEY ("answerId","variantId")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AnswerVariant_variantId_idx" ON "AnswerVariant"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Answer_participantId_questionId_key" ON "Answer"("participantId", "questionId");

-- AddForeignKey
ALTER TABLE "AnswerVariant" DROP CONSTRAINT IF EXISTS "AnswerVariant_answerId_fkey";
ALTER TABLE "AnswerVariant" ADD CONSTRAINT "AnswerVariant_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerVariant" DROP CONSTRAINT IF EXISTS "AnswerVariant_variantId_fkey";
ALTER TABLE "AnswerVariant" ADD CONSTRAINT "AnswerVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

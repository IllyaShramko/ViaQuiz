-- DropIndex
DROP INDEX IF EXISTS "Student_classroomId_login_key";

-- CreateIndex
CREATE UNIQUE INDEX "Student_login_key" ON "Student"("login");

import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { userRouter } from "../modules/users/user.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { quizRouter } from "../modules/quizzes/quiz.routes";
import { questionRouter } from "../modules/questions/question.routes";
import { classroomRouter } from "../modules/classrooms/classroom.routes";
import { studentRouter } from "../modules/students/student.routes";
import { gameSessionRouter } from "../modules/game-sessions/game-sessions.routes";
import { reportsRouter } from "../modules/reports/reports.routes";

export const apiRouter: Router = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/users", userRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/quizzes", quizRouter);
apiRouter.use("/questions", questionRouter);
apiRouter.use("/classrooms", classroomRouter);
apiRouter.use("/students", studentRouter);
apiRouter.use("/game-sessions", gameSessionRouter);
apiRouter.use("/reports", reportsRouter);


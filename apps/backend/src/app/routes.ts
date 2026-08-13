import { Router } from "express";
import { healthRoutes } from "../modules/health/health.routes";
import { userRouter } from "../modules/users/user.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { quizRouter } from "../modules/quizzes/quiz.routes";
import { questionRouter } from "../modules/questions/question.routes";

export const apiRouter: Router = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/users", userRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/quizzes", quizRouter);
apiRouter.use("/questions", questionRouter);


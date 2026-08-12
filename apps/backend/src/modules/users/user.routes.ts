import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authenticate } from "../../middlewares/index.js";

const router: Router = Router();
const controller = new UserController();

router.get("/", controller.getUsers);
router.get("/:id", authenticate, controller.getUserById);

export const userRoutes: Router = router;

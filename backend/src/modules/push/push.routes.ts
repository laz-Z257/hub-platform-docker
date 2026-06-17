import { Router } from "express";
import { registerToken } from "./push.controller";
import { validate } from "../../middlewares/validate";
import { registerPushSchema } from "./push.schema";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.post("/register", validate({ body: registerPushSchema }), registerToken);

export default router;

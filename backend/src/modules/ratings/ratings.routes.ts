import { Router } from "express";
import { createRating, getRating, getRatingStats } from "./ratings.controller";
import { createRatingSchema, ratingParamsSchema } from "./ratings.schema";
import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.use(authMiddleware);

router.post("/:id", validate({ body: createRatingSchema, params: ratingParamsSchema }), createRating);
router.get("/:id", validate({ params: ratingParamsSchema }), getRating);
router.get("/", adminOnly, getRatingStats);

export default router;

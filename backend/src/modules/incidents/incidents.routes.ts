import { Router } from "express";
import {
  createIncident,
  listIncidents,
  getIncident,
  updateIncident,
  addComment,
} from "./incidents.controller";
import { validate } from "../../middlewares/validate";
import {
  createIncidentSchema,
  updateIncidentSchema,
  commentSchema,
} from "./incidents.schema";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createIncidentSchema), createIncident);
router.get("/", listIncidents);
router.get("/:id", getIncident);
router.patch("/:id", adminOnly, validate(updateIncidentSchema), updateIncident);
router.post("/:id/comments", validate(commentSchema), addComment);

export default router;

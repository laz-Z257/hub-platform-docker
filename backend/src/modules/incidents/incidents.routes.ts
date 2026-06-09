import { Router } from "express";
import {
  createIncident,
  listIncidents,
  getIncident,
  updateIncident,
  addComment,
  getStats,
  deleteIncident,
} from "./incidents.controller";
import { validate } from "../../middlewares/validate";
import {
  createIncidentSchema,
  updateIncidentSchema,
  commentSchema,
  listIncidentsQuerySchema,
} from "./incidents.schema";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createIncidentSchema), createIncident);
router.get("/stats", getStats);
router.get("/", validate(listIncidentsQuerySchema), listIncidents);
router.get("/:id", getIncident);
router.patch("/:id", adminOnly, validate(updateIncidentSchema), updateIncident);
router.delete("/:id", adminOnly, deleteIncident);
router.post("/:id/comments", validate(commentSchema), addComment);

export default router;

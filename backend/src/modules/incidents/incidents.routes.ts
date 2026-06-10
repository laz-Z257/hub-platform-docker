import { Router } from "express";
import {
  createIncident,
  listIncidents,
  getIncident,
  updateIncident,
  addComment,
  getStats,
  getAgentes,
  deleteIncident,
} from "./incidents.controller";
import { validate } from "../../middlewares/validate";
import {
  createIncidentSchema,
  updateIncidentSchema,
  commentSchema,
  listIncidentsQuerySchema,
  uuidParamsSchema,
} from "./incidents.schema";
import { authMiddleware } from "../../middlewares/auth";
import { adminOnly } from "../../middlewares/admin";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createIncidentSchema), createIncident);
router.get("/agentes", getAgentes);
router.get("/stats", adminOnly, getStats);
router.get("/", validate(listIncidentsQuerySchema), listIncidents);
router.get("/:id", validate({ params: uuidParamsSchema }), getIncident);
router.patch("/:id", adminOnly, validate({ body: updateIncidentSchema, params: uuidParamsSchema }), updateIncident);
router.delete("/:id", adminOnly, validate({ params: uuidParamsSchema }), deleteIncident);
router.post("/:id/comments", validate({ body: commentSchema, params: uuidParamsSchema }), addComment);

export default router;

import { Router } from "express";
import { listPuntosVenta } from "./puntos-venta.controller";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", listPuntosVenta);

export default router;

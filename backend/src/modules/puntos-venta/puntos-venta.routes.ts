import { Router } from "express";
import { listPuntosVenta, seedPuntosVenta } from "./puntos-venta.controller";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.post("/seed", seedPuntosVenta);
router.use(authMiddleware);
router.get("/", listPuntosVenta);

export default router;

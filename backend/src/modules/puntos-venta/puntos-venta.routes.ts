import { Router } from "express";
import { listPuntosVenta, seedPuntosVenta } from "./puntos-venta.controller";
import { authMiddleware } from "../../middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", listPuntosVenta);
router.post("/seed", seedPuntosVenta);

export default router;

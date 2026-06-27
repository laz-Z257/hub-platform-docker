import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { type Request } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { csrfProtection } from "./middlewares/csrf";
import { requestId } from "./middlewares/requestId";
import { metricsMiddleware, getMetrics } from "./middlewares/metrics";
import { logger } from "./lib/logger";
import { env } from "./config/env";

import authRoutes from "./modules/auth/auth.routes";
import incidentsRoutes from "./modules/incidents/incidents.routes";
import chatRoutes from "./modules/chat/chat.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import usersRoutes from "./modules/users/users.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import ratingsRoutes from "./modules/ratings/ratings.routes";
import pushRoutes from "./modules/push/push.routes";
import puntosVentaRoutes from "./modules/puntos-venta/puntos-venta.routes";
import settingsRoutes from "./modules/settings/settings.routes";

const app = express();

app.use((req, res, next) => {
  if (env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https") {
    const host = req.headers.host || "";
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }
  next();
});

app.use(requestId);
app.use(metricsMiddleware);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: env.NODE_ENV === "development" ? ["'self'", "ws:", "http://localhost:*"] : ["'self'"],
      },
    },
  })
);
app.use(
  cors({
    origin:
      env.NODE_ENV === "development"
        ? [
            "http://localhost:3000",
            "http://localhost:8081",
            "http://localhost:19006",
            /^https?:\/\/localhost(:\d+)?$/,
          ]
        : env.CORS_ORIGIN?.split(",") ??
          (() => {
            throw new Error("CORS_ORIGIN es requerida en producción. Define la variable de entorno.");
          })(),
    credentials: true,
  })
);
morgan.token("request-id", (req) => (req as Request).requestId);
app.use(
  morgan(
    env.NODE_ENV === "production"
      ? ":remote-addr :method :url :status :response-time ms [:request-id]"
      : ":method :url :status :response-time ms [:request-id]"
  )
);
app.use(express.json());
app.use(cookieParser());
app.use(csrfProtection);

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Intenta de nuevo en 1 minuto." },
});

app.use(globalLimiter);

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    const { db } = await import("./db");
    await db.execute("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// Metrics
app.get("/api/metrics", (_req, res) => {
  res.json(getMetrics());
});

// Serve uploads
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/puntos-venta", puntosVentaRoutes);
app.use("/api/settings", settingsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    logger.error(`Unhandled error: ${err.message}`, {
      requestId: _req.requestId,
      stack: err.stack,
    });
    res.status(500).json({ error: "Error interno del servidor", requestId: _req.requestId });
  }
);

app.listen(env.PORT, () => {
  logger.info(`API running on port ${env.PORT}`, { environment: env.NODE_ENV });
});

export default app;

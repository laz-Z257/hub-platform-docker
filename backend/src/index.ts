import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";

import authRoutes from "./modules/auth/auth.routes";
import incidentsRoutes from "./modules/incidents/incidents.routes";
import chatRoutes from "./modules/chat/chat.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import usersRoutes from "./modules/users/users.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin:
      env.NODE_ENV === "development"
        ? ["http://localhost:3000", "http://localhost:8081"]
        : "*",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", usersRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

export default app;

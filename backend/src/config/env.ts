import dotenv from "dotenv";

dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error("JWT_SECRET es requerida. Define la variable de entorno.");
    })(),
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET ??
    (() => {
      throw new Error("JWT_REFRESH_SECRET es requerida. Define la variable de entorno.");
    })(),
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  DB_SSL: process.env.DB_SSL === "true",
  DB_SSL_REJECT_UNAUTHORIZED: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN || "hub.ai",
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};

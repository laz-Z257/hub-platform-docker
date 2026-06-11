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
      console.warn("⚠️  JWT_REFRESH_SECRET no configurado. Usando JWT_SECRET como fallback.");
      return process.env.JWT_SECRET || "";
    })(),
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
};

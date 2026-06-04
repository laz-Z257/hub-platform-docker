import dotenv from "dotenv";

dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error("JWT_SECRET es requerida. Define la variable de entorno.");
    })(),
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
};

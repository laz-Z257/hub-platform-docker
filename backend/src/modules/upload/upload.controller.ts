import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { logger } from "../../lib/logger";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const MAX_STORAGE_BYTES = 500 * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function getDirSize(): number {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    return files.reduce((total, file) => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, file));
      return total + stat.size;
    }, 0);
  } catch {
    return 0;
  }
}

export async function uploadFile(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No se envió ningún archivo" });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

    if (!allowed.includes(ext)) {
      res.status(400).json({ error: "Formato no permitido. Usa: png, jpg, jpeg, gif, webp" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      res.status(400).json({ error: "La imagen no puede superar los 5MB" });
      return;
    }

    const currentSize = getDirSize();
    if (currentSize + file.size > MAX_STORAGE_BYTES) {
      res.status(507).json({ error: "Almacenamiento de imágenes lleno. Contacta al administrador." });
      return;
    }

    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, file.buffer);

    const url = `/uploads/${filename}`;

    res.json({ url, filename });
  } catch (error) {
    logger.error("Upload error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al subir el archivo" });
  }
}

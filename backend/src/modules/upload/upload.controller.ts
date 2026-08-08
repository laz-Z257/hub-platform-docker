import { Request, Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { logger } from "../../lib/logger";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const MAX_STORAGE_BYTES = 500 * 1024 * 1024;

function hasImageSignature(buffer: Buffer, ext: string): boolean {
  if (ext === ".png") return buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  if (ext === ".jpg" || ext === ".jpeg") return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (ext === ".gif") return buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a";
  if (ext === ".webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function getDirSize(): Promise<number> {
  try {
    const files = await fs.promises.readdir(UPLOAD_DIR);
    let total = 0;
    for (const file of files) {
      const stat = await fs.promises.stat(path.join(UPLOAD_DIR, file));
      total += stat.size;
    }
    return total;
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

    if (!hasImageSignature(file.buffer, ext)) {
      res.status(400).json({ error: "El contenido del archivo no coincide con una imagen válida" });
      return;
    }

    const currentSize = await getDirSize();
    if (currentSize + file.size > MAX_STORAGE_BYTES) {
      res.status(507).json({ error: "Almacenamiento de imágenes lleno. Contacta al administrador." });
      return;
    }

    const filename = `${randomUUID()}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.promises.writeFile(filepath, file.buffer);

    const url = `/uploads/${filename}`;

    res.json({ url, filename });
  } catch (error) {
    logger.error("Upload error", { error: (error as Error).message });
    res.status(500).json({ error: "Error al subir el archivo" });
  }
}

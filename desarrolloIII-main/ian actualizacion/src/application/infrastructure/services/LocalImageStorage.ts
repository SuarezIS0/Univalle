import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import {
  ImageStorage,
  UploadInput,
  UploadResult,
} from "@/domain/services/ImageStorage";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export class LocalImageStorage implements ImageStorage {
  private readonly uploadDir: string;
  private readonly publicPrefix: string;

  constructor(
    uploadDir = process.env.LOCAL_UPLOAD_DIR ||
      path.join(process.cwd(), "public", "uploads"),
    publicPrefix = "/uploads"
  ) {
    this.uploadDir = uploadDir;
    this.publicPrefix = publicPrefix;
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const ext = MIME_EXT[input.mimeType.toLowerCase()];
    if (!ext) {
      throw new Error(`Tipo de imagen no soportado: ${input.mimeType}`);
    }
    await fs.mkdir(this.uploadDir, { recursive: true });

    const storageKey = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(this.uploadDir, storageKey);
    await fs.writeFile(filePath, input.buffer);

    return {
      url: `${this.publicPrefix}/${storageKey}`,
      storageKey,
    };
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storageKey);
    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      if (err?.code !== "ENOENT") throw err;
    }
  }
}

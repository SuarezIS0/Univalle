import crypto from "crypto";
import {
  ImageStorage,
  UploadInput,
  UploadResult,
} from "@/domain/services/ImageStorage";

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
};

export class CloudinaryImageStorage implements ImageStorage {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly uploadPreset: string | undefined;
  private readonly folder: string;

  constructor() {
    this.cloudName = required("CLOUDINARY_CLOUD_NAME");
    this.apiKey = process.env.CLOUDINARY_API_KEY ?? "";
    this.apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
    this.uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    this.folder = process.env.CLOUDINARY_FOLDER || "univalle-shop";
  }

  async upload(input: UploadInput): Promise<UploadResult> {
    const form = new FormData();
    const blob = new Blob([new Uint8Array(input.buffer)], {
      type: input.mimeType,
    });
    form.append("file", blob, input.filename);
    form.append("folder", this.folder);

    if (this.uploadPreset) {
      form.append("upload_preset", this.uploadPreset);
    } else {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = this.signParams({ folder: this.folder, timestamp });
      form.append("api_key", this.apiKey);
      form.append("timestamp", timestamp);
      form.append("signature", signature);
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudinary upload falló (${res.status}): ${text}`);
    }
    const json = (await res.json()) as CloudinaryUploadResponse;
    return { url: json.secure_url, storageKey: json.public_id };
  }

  async delete(storageKey: string): Promise<void> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.signParams({
      public_id: storageKey,
      timestamp,
    });
    const form = new FormData();
    form.append("public_id", storageKey);
    form.append("api_key", this.apiKey);
    form.append("timestamp", timestamp);
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      { method: "POST", body: form }
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudinary delete falló (${res.status}): ${text}`);
    }
  }

  private signParams(params: Record<string, string>): string {
    if (!this.apiSecret) {
      throw new Error(
        "CLOUDINARY_API_SECRET es requerido para operaciones firmadas (sin upload_preset)"
      );
    }
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");
    return crypto
      .createHash("sha1")
      .update(sorted + this.apiSecret)
      .digest("hex");
  }
}

function required(envVar: string): string {
  const value = process.env[envVar];
  if (!value) {
    throw new Error(`${envVar} no está configurado`);
  }
  return value;
}

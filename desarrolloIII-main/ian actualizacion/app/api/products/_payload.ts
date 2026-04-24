import { UploadInput } from "@/domain/services/ImageStorage";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type ProductPayload = {
  name?: string;
  description?: string;
  price?: number | string;
  stock?: number | string;
  category?: string;
  imageFile?: UploadInput;
};

export async function parseProductPayload(req: Request): Promise<ProductPayload> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const payload: ProductPayload = {};

    const get = (key: string) => {
      const v = form.get(key);
      return typeof v === "string" ? v : undefined;
    };

    payload.name = get("name");
    payload.description = get("description");
    payload.price = get("price");
    payload.stock = get("stock");
    payload.category = get("category");

    const file = form.get("image");
    if (file && typeof file !== "string") {
      const f = file as File;
      if (f.size > 0) {
        if (f.size > MAX_BYTES) {
          throw new Error("La imagen supera el límite de 5 MB");
        }
        if (!ALLOWED_MIME.has(f.type.toLowerCase())) {
          throw new Error(`Tipo de imagen no permitido: ${f.type}`);
        }
        const buffer = Buffer.from(await f.arrayBuffer());
        payload.imageFile = {
          buffer,
          mimeType: f.type,
          filename: f.name,
        };
      }
    }
    return payload;
  }

  return (await req.json()) as ProductPayload;
}

import { Product, ProductCategory } from "@/domain/entities/Product";
import { ProductImage } from "@/domain/entities/ProductImage";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ImageStorage, UploadInput } from "@/domain/services/ImageStorage";

export type UpdateProductDTO = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  imageFile?: UploadInput;
};

export class UpdateProduct {
  constructor(
    private productRepository: ProductRepository,
    private imageStorage: ImageStorage
  ) {}

  async execute(id: string, updates: UpdateProductDTO): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }

    let newImage: ProductImage | undefined;
    let oldKeyToCleanup: string | null = null;
    let uploadedKey: string | null = null;

    if (updates.imageFile) {
      const result = await this.imageStorage.upload(updates.imageFile);
      newImage = new ProductImage(result.url, result.storageKey);
      uploadedKey = result.storageKey;
      if (!existing.image.isEmpty() && !existing.image.isExternal()) {
        oldKeyToCleanup = existing.image.storageKey;
      }
    }

    try {
      existing.applyPatch({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        stock: updates.stock,
        category: updates.category,
        image: newImage,
      });

      const persisted = await this.productRepository.update(id, {
        name: existing.name,
        description: existing.description,
        price: existing.price,
        stock: existing.stock,
        category: existing.category,
        ...(newImage !== undefined && { image: newImage }),
      });
      if (!persisted) {
        throw new Error("No se pudo actualizar el producto");
      }

      if (oldKeyToCleanup) {
        await this.imageStorage
          .delete(oldKeyToCleanup)
          .catch(() => undefined);
      }
      return persisted;
    } catch (err) {
      if (uploadedKey) {
        await this.imageStorage.delete(uploadedKey).catch(() => undefined);
      }
      throw err;
    }
  }
}

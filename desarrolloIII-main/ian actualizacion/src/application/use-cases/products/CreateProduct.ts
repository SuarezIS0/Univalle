import { Product, ProductCategory } from "@/domain/entities/Product";
import { ProductImage } from "@/domain/entities/ProductImage";
import { ProductRepository } from "@/domain/repositories/ProductRepository";
import { ImageStorage, UploadInput } from "@/domain/services/ImageStorage";

export type CreateProductDTO = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: ProductCategory;
  imageFile?: UploadInput;
};

export class CreateProduct {
  constructor(
    private productRepository: ProductRepository,
    private imageStorage: ImageStorage
  ) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    let image = ProductImage.empty();
    let uploadedKey: string | null = null;

    if (data.imageFile) {
      const result = await this.imageStorage.upload(data.imageFile);
      image = new ProductImage(result.url, result.storageKey);
      uploadedKey = result.storageKey;
    }

    try {
      const product = new Product(
        crypto.randomUUID(),
        data.name,
        data.description,
        data.price,
        data.stock,
        image,
        data.category ?? "otros"
      );
      return await this.productRepository.save(product);
    } catch (err) {
      if (uploadedKey) {
        await this.imageStorage.delete(uploadedKey).catch(() => undefined);
      }
      throw err;
    }
  }
}

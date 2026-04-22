import { Product, ProductCategory } from "@/domain/entities/Product";
import { ProductRepository } from "@/domain/repositories/ProductRepository";

export type UpdateProductDTO = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image?: string;
  category?: ProductCategory;
};

export class UpdateProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string, updates: UpdateProductDTO): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new Error("Producto no encontrado");
    }
    const updated = await this.productRepository.update(id, updates);
    if (!updated) {
      throw new Error("No se pudo actualizar el producto");
    }
    return updated;
  }
}

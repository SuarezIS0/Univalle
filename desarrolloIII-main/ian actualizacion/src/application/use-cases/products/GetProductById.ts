import { Product } from "@/domain/entities/Product";
import { ProductRepository } from "@/domain/repositories/ProductRepository";

export class GetProductById {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return product;
  }
}

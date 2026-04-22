import { ProductRepository } from "@/domain/repositories/ProductRepository";

export class DeleteProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const ok = await this.productRepository.delete(id);
    if (!ok) {
      throw new Error("Producto no encontrado");
    }
  }
}

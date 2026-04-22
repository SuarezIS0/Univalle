import { Product, ProductCategory } from "@/domain/entities/Product";
import { ProductRepository } from "@/domain/repositories/ProductRepository";

export type CreateProductDTO = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category?: ProductCategory;
};

export class CreateProduct {
  constructor(private productRepository: ProductRepository) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    const product = new Product(
      crypto.randomUUID(),
      data.name,
      data.description,
      data.price,
      data.stock,
      data.image ?? "",
      data.category ?? "otros"
    );
    return this.productRepository.save(product);
  }
}

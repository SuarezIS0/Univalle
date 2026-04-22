import { Product } from "@/domain/entities/Product";
import {
  ProductFilters,
  ProductRepository,
} from "@/domain/repositories/ProductRepository";

export class GetProducts {
  constructor(private productRepository: ProductRepository) {}

  async execute(filters?: ProductFilters): Promise<Product[]> {
    return this.productRepository.findAll(filters);
  }
}

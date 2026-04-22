import { Product, ProductCategory } from "../entities/Product";

export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
}

export interface ProductRepository {
  save(product: Product): Promise<Product>;
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(id: string, updates: Partial<Product>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

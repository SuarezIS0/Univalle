import { Product, ProductCategory, ProductPatch } from "../entities/Product";

export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  includeArchived?: boolean;
}

export interface ProductRepository {
  save(product: Product): Promise<Product>;
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(id: string, updates: ProductPatch): Promise<Product | null>;
  archive(id: string): Promise<Product | null>;
  restore(id: string): Promise<Product | null>;
}

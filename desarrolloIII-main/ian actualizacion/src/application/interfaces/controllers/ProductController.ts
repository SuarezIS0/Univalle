import { MongoProductRepository } from "@/application/infrastructure/database/repositories/MongoProductRepository";
import {
  CreateProduct,
  CreateProductDTO,
} from "@/application/use-cases/products/CreateProduct";
import { GetProducts } from "@/application/use-cases/products/GetProducts";
import { GetProductById } from "@/application/use-cases/products/GetProductById";
import {
  UpdateProduct,
  UpdateProductDTO,
} from "@/application/use-cases/products/UpdateProduct";
import { DeleteProduct } from "@/application/use-cases/products/DeleteProduct";
import { ProductFilters } from "@/domain/repositories/ProductRepository";

function repo() {
  return new MongoProductRepository();
}

export class ProductController {
  static async create(data: CreateProductDTO) {
    return new CreateProduct(repo()).execute(data);
  }

  static async getAll(filters?: ProductFilters) {
    return new GetProducts(repo()).execute(filters);
  }

  static async getById(id: string) {
    return new GetProductById(repo()).execute(id);
  }

  static async update(id: string, data: UpdateProductDTO) {
    return new UpdateProduct(repo()).execute(id, data);
  }

  static async delete(id: string) {
    return new DeleteProduct(repo()).execute(id);
  }
}

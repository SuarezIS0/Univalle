import { MongoProductRepository } from "@/application/infrastructure/database/repositories/MongoProductRepository";
import { MongoOrderRepository } from "@/application/infrastructure/database/repositories/MongoOrderRepository";
import { LocalImageStorage } from "@/application/infrastructure/services/LocalImageStorage";
import { CloudinaryImageStorage } from "@/application/infrastructure/services/CloudinaryImageStorage";
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
import { ArchiveProduct } from "@/application/use-cases/products/ArchiveProduct";
import { ProductFilters } from "@/domain/repositories/ProductRepository";
import { ImageStorage } from "@/domain/services/ImageStorage";

function productRepo() {
  return new MongoProductRepository();
}

function orderRepo() {
  return new MongoOrderRepository();
}

function imageStorage(): ImageStorage {
  const driver = (process.env.STORAGE_DRIVER || "local").toLowerCase();
  if (driver === "cloudinary") return new CloudinaryImageStorage();
  return new LocalImageStorage();
}

export class ProductController {
  static async create(data: CreateProductDTO) {
    return new CreateProduct(productRepo(), imageStorage()).execute(data);
  }

  static async getAll(filters?: ProductFilters) {
    return new GetProducts(productRepo()).execute(filters);
  }

  static async getById(id: string) {
    return new GetProductById(productRepo()).execute(id);
  }

  static async update(id: string, data: UpdateProductDTO) {
    return new UpdateProduct(productRepo(), imageStorage()).execute(id, data);
  }

  static async archive(id: string) {
    return new ArchiveProduct(
      productRepo(),
      orderRepo(),
      imageStorage()
    ).execute(id);
  }
}

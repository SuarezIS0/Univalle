import { Product, ProductCategory } from "@/domain/entities/Product";
import {
  ProductRepository,
  ProductFilters,
} from "@/domain/repositories/ProductRepository";
import { ProductModel } from "../models/ProductModel";

function toDomain(doc: any): Product {
  return new Product(
    doc._id.toString(),
    doc.name,
    doc.description,
    doc.price,
    doc.stock ?? 0,
    doc.image ?? "",
    (doc.category ?? "otros") as ProductCategory
  );
}

export class MongoProductRepository implements ProductRepository {
  async save(product: Product): Promise<Product> {
    const doc = await ProductModel.create({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      category: product.category,
    });
    return toDomain(doc);
  }

  async findAll(filters: ProductFilters = {}): Promise<Product[]> {
    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }
    const docs = await ProductModel.find(query).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const doc = await ProductModel.findById(id);
      return doc ? toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const doc = await ProductModel.findByIdAndUpdate(
      id,
      {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.description !== undefined && {
          description: updates.description,
        }),
        ...(updates.price !== undefined && { price: updates.price }),
        ...(updates.stock !== undefined && { stock: updates.stock }),
        ...(updates.image !== undefined && { image: updates.image }),
        ...(updates.category !== undefined && { category: updates.category }),
      },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return result !== null;
  }
}

import { Product, ProductCategory, ProductPatch } from "@/domain/entities/Product";
import { ProductImage } from "@/domain/entities/ProductImage";
import {
  ProductRepository,
  ProductFilters,
} from "@/domain/repositories/ProductRepository";
import { ProductModel } from "../models/ProductModel";

function toDomain(doc: any): Product {
  const image =
    doc.image && doc.image.url && doc.image.storageKey
      ? new ProductImage(doc.image.url, doc.image.storageKey)
      : ProductImage.empty();

  return new Product(
    doc._id.toString(),
    doc.name,
    doc.description,
    doc.price,
    doc.stock ?? 0,
    image,
    (doc.category ?? "otros") as ProductCategory,
    doc.archivedAt ?? null
  );
}

function toImageDoc(image: ProductImage) {
  return image.isEmpty()
    ? null
    : { url: image.url, storageKey: image.storageKey };
}

export class MongoProductRepository implements ProductRepository {
  async save(product: Product): Promise<Product> {
    const doc = await ProductModel.create({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: toImageDoc(product.image),
      category: product.category,
    });
    return toDomain(doc);
  }

  async findAll(filters: ProductFilters = {}): Promise<Product[]> {
    const query: any = {};
    if (!filters.includeArchived) query.archivedAt = null;
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

  async update(id: string, updates: ProductPatch): Promise<Product | null> {
    const set: any = {};
    if (updates.name !== undefined) set.name = updates.name;
    if (updates.description !== undefined) set.description = updates.description;
    if (updates.price !== undefined) set.price = updates.price;
    if (updates.stock !== undefined) set.stock = updates.stock;
    if (updates.category !== undefined) set.category = updates.category;
    if (updates.image !== undefined) set.image = toImageDoc(updates.image);

    const doc = await ProductModel.findByIdAndUpdate(id, set, { new: true });
    return doc ? toDomain(doc) : null;
  }

  async archive(id: string): Promise<Product | null> {
    const doc = await ProductModel.findByIdAndUpdate(
      id,
      { archivedAt: new Date() },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }

  async restore(id: string): Promise<Product | null> {
    const doc = await ProductModel.findByIdAndUpdate(
      id,
      { archivedAt: null },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }
}

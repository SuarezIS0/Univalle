const { ProductRepository } = require("../../domain/repositories/ProductRepository");
const { Product } = require("../../domain/entities/Product");
const ProductModel = require("./ProductModel");

function toDomain(doc) {
  if (!doc) return null;
  return new Product({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    price: doc.price,
    stock: doc.stock,
    image: doc.image ? { url: doc.image.url, storageKey: doc.image.storageKey } : null,
    category: doc.category,
    archivedAt: doc.archivedAt,
  });
}

class MongoProductRepository extends ProductRepository {
  async findAll({ category, search, includeArchived } = {}) {
    const q = {};
    if (!includeArchived) q.archivedAt = null;
    if (category) q.category = category;
    if (search) q.name = { $regex: search, $options: "i" };
    return (await ProductModel.find(q)).map(toDomain);
  }
  async findById(id) {
    try { return toDomain(await ProductModel.findById(id)); }
    catch { return null; }
  }
  async save(product) {
    const created = await ProductModel.create({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      category: product.category,
    });
    return toDomain(created);
  }
  async update(id, changes) {
    return toDomain(await ProductModel.findByIdAndUpdate(id, changes, { new: true }));
  }
  async persist(product) {
    return toDomain(
      await ProductModel.findByIdAndUpdate(
        product.id,
        {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          image: product.image,
          category: product.category,
          archivedAt: product.archivedAt,
        },
        { new: true }
      )
    );
  }
  async deleteAll() { return ProductModel.deleteMany({}); }
  async insertMany(products) {
    const docs = await ProductModel.insertMany(products);
    return docs.map(toDomain);
  }
  async count() { return ProductModel.countDocuments(); }
}

module.exports = { MongoProductRepository };

const { Product } = require("../../domain/entities/Product");

class CreateProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute(data) {
    const product = new Product({
      name: data.name,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock ?? 0),
      image: data.image ?? null,
      category: data.category ?? "otros",
    });
    return this.productRepository.save(product);
  }
}
module.exports = { CreateProduct };

class UpdateProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id, changes }) {
    const clean = {};
    if (changes.name !== undefined) clean.name = changes.name;
    if (changes.description !== undefined) clean.description = changes.description;
    if (changes.price !== undefined) clean.price = Number(changes.price);
    if (changes.stock !== undefined) clean.stock = Number(changes.stock);
    if (changes.category !== undefined) clean.category = changes.category;
    if (changes.image !== undefined) clean.image = changes.image;
    const updated = await this.productRepository.update(id, clean);
    if (!updated) throw new Error("Producto no encontrado");
    return updated;
  }
}
module.exports = { UpdateProduct };

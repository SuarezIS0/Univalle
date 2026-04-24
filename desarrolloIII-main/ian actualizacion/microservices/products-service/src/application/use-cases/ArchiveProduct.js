class ArchiveProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id }) {
    const p = await this.productRepository.findById(id);
    if (!p) throw new Error("Producto no encontrado");
    p.archive();
    return this.productRepository.persist(p);
  }
}
module.exports = { ArchiveProduct };

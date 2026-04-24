class ReleaseStock {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id, quantity }) {
    const p = await this.productRepository.findById(id);
    if (!p) return null; // producto borrado: nada que compensar
    p.releaseStock(quantity);
    return this.productRepository.persist(p);
  }
}
module.exports = { ReleaseStock };

class ReduceStock {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id, quantity }) {
    const p = await this.productRepository.findById(id);
    if (!p) throw new Error("Producto no encontrado");
    p.reduceStock(quantity);
    return this.productRepository.persist(p);
  }
}
module.exports = { ReduceStock };

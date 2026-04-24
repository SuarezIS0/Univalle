class GetProduct {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ id, allowArchived = false }) {
    const p = await this.productRepository.findById(id);
    if (!p) throw new Error("Producto no encontrado");
    if (!allowArchived && p.isArchived()) {
      const err = new Error("Producto archivado");
      err.code = "ARCHIVED";
      throw err;
    }
    return p;
  }
}
module.exports = { GetProduct };

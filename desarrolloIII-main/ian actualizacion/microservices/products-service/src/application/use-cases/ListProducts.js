class ListProducts {
  constructor({ productRepository }) { this.productRepository = productRepository; }
  async execute({ category, search, includeArchived } = {}) {
    return this.productRepository.findAll({ category, search, includeArchived });
  }
}
module.exports = { ListProducts };

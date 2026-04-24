class ProductRepository {
  async findAll(_filters) { throw new Error("not implemented"); }
  async findById(_id) { throw new Error("not implemented"); }
  async save(_product) { throw new Error("not implemented"); }
  async update(_id, _changes) { throw new Error("not implemented"); }
  async persist(_product) { throw new Error("not implemented"); }
  async deleteAll() { throw new Error("not implemented"); }
  async insertMany(_products) { throw new Error("not implemented"); }
  async count() { throw new Error("not implemented"); }
}
module.exports = { ProductRepository };

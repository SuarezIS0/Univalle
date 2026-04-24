class OrderRepository {
  async save(_order) { throw new Error("not implemented"); }
  async findById(_id) { throw new Error("not implemented"); }
  async findAll() { throw new Error("not implemented"); }
  async findByUser(_userId) { throw new Error("not implemented"); }
  async update(_id, _changes) { throw new Error("not implemented"); }
  async countByStatus(_status) { throw new Error("not implemented"); }
  async findWithStatusIn(_statuses) { throw new Error("not implemented"); }
}
module.exports = { OrderRepository };

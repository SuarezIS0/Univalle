class OutboxRepository {
  async save(_event) { throw new Error("not implemented"); }
  async findUnpublished(_limit) { throw new Error("not implemented"); }
  async markPublished(_id) { throw new Error("not implemented"); }
}
module.exports = { OutboxRepository };

class PaymentRepository {
  async save(_payment) { throw new Error("not implemented"); }
  async findByOrder(_orderId) { throw new Error("not implemented"); }
}
module.exports = { PaymentRepository };

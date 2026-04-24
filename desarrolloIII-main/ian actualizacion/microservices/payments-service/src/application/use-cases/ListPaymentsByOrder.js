class ListPaymentsByOrder {
  constructor({ paymentRepository }) { this.paymentRepository = paymentRepository; }
  async execute({ orderId }) {
    return this.paymentRepository.findByOrder(orderId);
  }
}
module.exports = { ListPaymentsByOrder };

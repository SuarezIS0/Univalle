class ConfirmOrder {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ id }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");
    order.confirm();
    return this.orderRepository.update(id, { status: order.status });
  }
}
module.exports = { ConfirmOrder };

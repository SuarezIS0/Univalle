class UpdateOrderStatus {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ id, status }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");
    order.changeStatus(status);
    return this.orderRepository.update(id, { status: order.status });
  }
}
module.exports = { UpdateOrderStatus };

class GetOrder {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ id, requesterId, requesterRole }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");
    if (!order.belongsTo(requesterId) && requesterRole !== "admin") {
      const err = new Error("No autorizado"); err.code = "FORBIDDEN"; throw err;
    }
    return order;
  }
}
module.exports = { GetOrder };

class ListOrders {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute({ userId, scope }) {
    if (scope === "all") return this.orderRepository.findAll();
    return this.orderRepository.findByUser(userId);
  }
}
module.exports = { ListOrders };

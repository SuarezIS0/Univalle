class GetMetrics {
  constructor({ orderRepository }) { this.orderRepository = orderRepository; }
  async execute() {
    const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    const counts = await Promise.all(statuses.map((s) => this.orderRepository.countByStatus(s)));
    const paid = await this.orderRepository.findWithStatusIn(["confirmed", "shipped", "delivered"]);
    const totalSales = paid.reduce((s, o) => s + (o.total || 0), 0);
    return {
      totalSales,
      orders: {
        pending: counts[0],
        confirmed: counts[1],
        shipped: counts[2],
        delivered: counts[3],
        cancelled: counts[4],
        total: counts.reduce((a, b) => a + b, 0),
      },
    };
  }
}
module.exports = { GetMetrics };

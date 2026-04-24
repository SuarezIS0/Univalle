const { OutboxEvent } = require("../../domain/entities/OutboxEvent");

class CancelOrder {
  constructor({ orderRepository, outboxRepository }) {
    this.orderRepository = orderRepository;
    this.outboxRepository = outboxRepository;
  }

  async execute({ id, reason = null }) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");

    const changed = order.cancel();
    if (!changed) return order;

    const updated = await this.orderRepository.update(id, { status: order.status });

    const event = new OutboxEvent({
      type: "order.cancelled",
      payload: {
        orderId: updated.id,
        userId: updated.userId,
        reason,
        items: updated.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
    });
    await this.outboxRepository.save(event);

    return updated;
  }
}

module.exports = { CancelOrder };

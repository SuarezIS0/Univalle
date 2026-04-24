class HandlePaymentFailed {
  constructor({ cancelOrder, processedEventStore }) {
    this.cancelOrder = cancelOrder;
    this.processedEventStore = processedEventStore;
  }
  async execute({ eventId, payload }) {
    const fresh = await this.processedEventStore.markIfNew(eventId);
    if (!fresh) return;
    try {
      await this.cancelOrder.execute({ id: payload.orderId, reason: payload.reason || "payment failed" });
    } catch (e) {
      if (/no encontrada|enviada/i.test(e.message)) return;
      throw e;
    }
  }
}
module.exports = { HandlePaymentFailed };

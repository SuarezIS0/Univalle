class HandlePaymentApproved {
  constructor({ confirmOrder, processedEventStore }) {
    this.confirmOrder = confirmOrder;
    this.processedEventStore = processedEventStore;
  }
  async execute({ eventId, payload }) {
    const fresh = await this.processedEventStore.markIfNew(eventId);
    if (!fresh) return;
    try {
      await this.confirmOrder.execute({ id: payload.orderId });
    } catch (e) {
      // Si la orden ya está confirmada/cancelada, no es error fatal del consumidor.
      if (/pendientes|no encontrada/i.test(e.message)) return;
      throw e;
    }
  }
}
module.exports = { HandlePaymentApproved };

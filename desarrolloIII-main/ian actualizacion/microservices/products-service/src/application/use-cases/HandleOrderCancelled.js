class HandleOrderCancelled {
  constructor({ releaseStock, processedEventStore }) {
    this.releaseStock = releaseStock;
    this.processedEventStore = processedEventStore;
  }
  async execute({ eventId, payload }) {
    const fresh = await this.processedEventStore.markIfNew(eventId);
    if (!fresh) return;
    for (const item of payload.items || []) {
      try {
        await this.releaseStock.execute({ id: item.productId, quantity: item.quantity });
      } catch (e) {
        console.error("[release-stock] falló", item.productId, e.message);
      }
    }
  }
}
module.exports = { HandleOrderCancelled };

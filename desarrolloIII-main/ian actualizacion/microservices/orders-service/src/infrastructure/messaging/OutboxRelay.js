class OutboxRelay {
  constructor({ outboxRepository, publisher, intervalMs = 1000, batchSize = 50 }) {
    this.outboxRepository = outboxRepository;
    this.publisher = publisher;
    this.intervalMs = intervalMs;
    this.batchSize = batchSize;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.timer) return;
    const tick = async () => {
      if (this.running) return;
      this.running = true;
      try {
        const pending = await this.outboxRepository.findUnpublished(this.batchSize);
        for (const event of pending) {
          try {
            await this.publisher.publish(event);
            await this.outboxRepository.markPublished(event.id);
          } catch (e) {
            console.error("[outbox] publish failed", event.eventId, e.message);
            break;
          }
        }
      } catch (e) {
        console.error("[outbox] relay tick failed", e.message);
      } finally {
        this.running = false;
      }
    };
    this.timer = setInterval(tick, this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

module.exports = { OutboxRelay };

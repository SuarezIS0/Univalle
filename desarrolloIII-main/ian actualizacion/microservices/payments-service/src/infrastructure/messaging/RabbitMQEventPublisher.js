const amqp = require("amqplib");
const { EventPublisher } = require("../../domain/events/EventPublisher");

const EXCHANGE = "domain-events";

async function connectWithRetry(url, { tries = 30, delayMs = 2000 } = {}) {
  let lastErr;
  for (let i = 1; i <= tries; i++) {
    try {
      return await amqp.connect(url);
    } catch (e) {
      lastErr = e;
      console.warn(`[rabbit] intento ${i}/${tries} falló (${e.code || e.message}); reintentando en ${delayMs}ms`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

class RabbitMQEventPublisher extends EventPublisher {
  constructor({ url }) {
    super();
    this.url = url;
    this.channel = null;
  }

  async connect() {
    const conn = await connectWithRetry(this.url);
    this.channel = await conn.createChannel();
    await this.channel.assertExchange(EXCHANGE, "topic", { durable: true });
    conn.on("error", (e) => console.error("[rabbit] connection error", e.message));
    conn.on("close", () => console.error("[rabbit] connection closed"));
  }

  async publish(event) {
    if (!this.channel) throw new Error("publisher no conectado");
    const body = Buffer.from(JSON.stringify(event.payload));
    this.channel.publish(EXCHANGE, event.type, body, {
      persistent: true,
      messageId: event.eventId,
      contentType: "application/json",
      type: event.type,
    });
  }
}

module.exports = { RabbitMQEventPublisher, EXCHANGE };

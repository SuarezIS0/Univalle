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
  constructor({ url, connection }) {
    super();
    this.url = url;
    this.connection = connection ?? null;
    this.channel = null;
  }

  async connect() {
    if (!this.connection) this.connection = await connectWithRetry(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE, "topic", { durable: true });
    return this.connection;
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

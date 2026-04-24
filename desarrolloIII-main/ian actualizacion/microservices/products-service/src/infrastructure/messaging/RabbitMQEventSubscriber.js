const amqp = require("amqplib");

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

class RabbitMQEventSubscriber {
  constructor({ url, queueName }) {
    this.url = url;
    this.queueName = queueName;
    this.connection = null;
    this.channel = null;
    this.handlers = new Map();
  }

  async connect() {
    this.connection = await connectWithRetry(this.url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(EXCHANGE, "topic", { durable: true });
    await this.channel.assertQueue(this.queueName, { durable: true });
    await this.channel.prefetch(10);
  }

  async subscribe(routingKey, handler) {
    if (!this.channel) throw new Error("subscriber no conectado");
    await this.channel.bindQueue(this.queueName, EXCHANGE, routingKey);
    this.handlers.set(routingKey, handler);
  }

  async start() {
    if (!this.channel) throw new Error("subscriber no conectado");
    await this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;
      const routingKey = msg.fields.routingKey;
      const handler = this.handlers.get(routingKey);
      if (!handler) {
        this.channel.ack(msg);
        return;
      }
      const eventId = msg.properties.messageId;
      try {
        const payload = JSON.parse(msg.content.toString());
        await handler({ eventId, type: routingKey, payload });
        this.channel.ack(msg);
      } catch (e) {
        console.error("[subscriber] handler failed", routingKey, e.message);
        this.channel.nack(msg, false, false);
      }
    });
  }
}

module.exports = { RabbitMQEventSubscriber };

const { randomUUID } = require("crypto");

class OutboxEvent {
  constructor({ id = null, eventId, type, payload, publishedAt = null, createdAt = null }) {
    if (!type) throw new Error("type requerido");
    if (!payload) throw new Error("payload requerido");
    this.id = id;
    this.eventId = eventId ?? randomUUID();
    this.type = type;
    this.payload = payload;
    this.publishedAt = publishedAt;
    this.createdAt = createdAt;
  }
  isPublished() { return this.publishedAt !== null; }
  markPublished() { this.publishedAt = new Date(); }
}
module.exports = { OutboxEvent };

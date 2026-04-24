const { OutboxRepository } = require("../../domain/repositories/OutboxRepository");
const { OutboxEvent } = require("../../domain/entities/OutboxEvent");
const OutboxModel = require("./OutboxModel");

function toDomain(doc) {
  if (!doc) return null;
  return new OutboxEvent({
    id: doc._id.toString(),
    eventId: doc.eventId,
    type: doc.type,
    payload: doc.payload,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
  });
}

class MongoOutboxRepository extends OutboxRepository {
  async save(event) {
    const created = await OutboxModel.create({
      eventId: event.eventId,
      type: event.type,
      payload: event.payload,
      publishedAt: event.publishedAt,
    });
    return toDomain(created);
  }
  async findUnpublished(limit = 50) {
    const docs = await OutboxModel.find({ publishedAt: null })
      .sort({ createdAt: 1 })
      .limit(limit);
    return docs.map(toDomain);
  }
  async markPublished(id) {
    await OutboxModel.findByIdAndUpdate(id, { publishedAt: new Date() });
  }
}

module.exports = { MongoOutboxRepository };

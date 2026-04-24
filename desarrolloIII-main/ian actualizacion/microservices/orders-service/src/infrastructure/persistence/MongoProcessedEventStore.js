const { ProcessedEventStore } = require("../../domain/services/ProcessedEventStore");
const ProcessedEventModel = require("./ProcessedEventModel");

class MongoProcessedEventStore extends ProcessedEventStore {
  async markIfNew(eventId) {
    if (!eventId) return true; // sin id no podemos deduplicar; procesamos
    try {
      await ProcessedEventModel.create({ eventId });
      return true;
    } catch (e) {
      if (e?.code === 11000) return false; // ya procesado
      throw e;
    }
  }
}

module.exports = { MongoProcessedEventStore };

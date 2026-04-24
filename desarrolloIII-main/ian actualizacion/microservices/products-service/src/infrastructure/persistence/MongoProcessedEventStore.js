const { ProcessedEventStore } = require("../../domain/services/ProcessedEventStore");
const ProcessedEventModel = require("./ProcessedEventModel");

class MongoProcessedEventStore extends ProcessedEventStore {
  async markIfNew(eventId) {
    if (!eventId) return true;
    try {
      await ProcessedEventModel.create({ eventId });
      return true;
    } catch (e) {
      if (e?.code === 11000) return false;
      throw e;
    }
  }
}

module.exports = { MongoProcessedEventStore };

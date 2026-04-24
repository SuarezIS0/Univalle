const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("ProcessedEvent", schema);

const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    cardLast4: String,
    status: { type: String, enum: ["approved", "rejected"], required: true },
    transactionId: String,
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", schema);

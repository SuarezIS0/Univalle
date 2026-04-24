const mongoose = require("mongoose");
const { STATUSES } = require("../../domain/entities/Order");

const OrderItem = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);
const Shipping = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);
const schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItem], required: true },
    total: { type: Number, required: true, min: 0 },
    shipping: { type: Shipping, required: true },
    status: { type: String, enum: STATUSES, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", schema);

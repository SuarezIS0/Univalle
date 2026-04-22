import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const ShippingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    shipping: { type: ShippingSchema, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);

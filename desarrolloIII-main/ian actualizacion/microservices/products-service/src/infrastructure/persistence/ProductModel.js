const mongoose = require("mongoose");
const { CATEGORIES } = require("../../domain/entities/Product");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { url: String, storageKey: String },
    category: { type: String, enum: CATEGORIES, default: "otros" },
    archivedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", schema);

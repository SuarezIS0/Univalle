import mongoose from "mongoose";

const ProductImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    storageKey: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: ProductImageSchema, default: null },
    category: {
      type: String,
      enum: ["ropa", "accesorios", "libros", "papeleria", "tecnologia", "otros"],
      default: "otros",
    },
    archivedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

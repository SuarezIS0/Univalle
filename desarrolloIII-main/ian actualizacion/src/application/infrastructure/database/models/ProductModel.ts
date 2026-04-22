import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: "" },
    category: {
      type: String,
      enum: ["ropa", "accesorios", "libros", "papeleria", "tecnologia", "otros"],
      default: "otros",
    },
  },
  { timestamps: true }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

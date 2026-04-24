const CATEGORIES = ["ropa", "accesorios", "libros", "papeleria", "tecnologia", "otros"];

class Product {
  constructor({ id, name, description, price, stock, image = null, category = "otros", archivedAt = null }) {
    if (!name) throw new Error("Nombre requerido");
    if (!description) throw new Error("Descripción requerida");
    if (typeof price !== "number" || price < 0) throw new Error("Precio inválido");
    if (typeof stock !== "number" || stock < 0) throw new Error("Stock inválido");
    if (!CATEGORIES.includes(category)) throw new Error("Categoría inválida");
    this.id = id ?? null;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.image = image; // { url, storageKey } | null
    this.category = category;
    this.archivedAt = archivedAt;
  }

  hasStock(qty) { return this.stock >= qty; }
  reduceStock(qty) {
    if (!this.hasStock(qty)) throw new Error("Stock insuficiente");
    this.stock -= qty;
  }
  releaseStock(qty) {
    if (typeof qty !== "number" || qty <= 0) throw new Error("Cantidad inválida");
    this.stock += qty;
  }
  archive() { this.archivedAt = new Date(); }
  isArchived() { return this.archivedAt !== null; }

  static categories() { return [...CATEGORIES]; }
}

module.exports = { Product, CATEGORIES };

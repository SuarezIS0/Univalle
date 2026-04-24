const { ProductCatalog } = require("../../domain/services/ProductCatalog");

class HttpProductCatalog extends ProductCatalog {
  constructor({ baseUrl }) { super(); this.baseUrl = baseUrl; }

  async getProduct(id) {
    const r = await fetch(`${this.baseUrl}/products/${id}`);
    if (!r.ok) return null;
    const { data } = await r.json();
    return {
      id: data._id,
      name: data.name,
      price: data.price,
      stock: data.stock,
      image: data.image,
    };
  }

  async reduceStock(id, quantity) {
    const r = await fetch(`${this.baseUrl}/products/${id}/reduce-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      throw new Error(err.error || "No se pudo reducir stock");
    }
  }
}

module.exports = { HttpProductCatalog };

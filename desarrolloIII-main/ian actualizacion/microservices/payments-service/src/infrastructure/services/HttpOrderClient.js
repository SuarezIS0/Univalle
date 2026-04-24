const { OrderClient } = require("../../domain/services/OrderClient");

class HttpOrderClient extends OrderClient {
  constructor({ baseUrl }) { super(); this.baseUrl = baseUrl; }

  async getOrder(id, authHeader) {
    const r = await fetch(`${this.baseUrl}/orders/${id}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    if (!r.ok) return null;
    const { data } = await r.json();
    return data;
  }

  async confirmOrder(id) {
    const r = await fetch(`${this.baseUrl}/orders/${id}/confirm`, { method: "POST" });
    if (!r.ok) throw new Error("No se pudo confirmar la orden");
  }
}

module.exports = { HttpOrderClient };

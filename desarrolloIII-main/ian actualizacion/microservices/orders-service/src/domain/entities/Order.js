const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

class Order {
  constructor({ id, userId, items, total, shipping, status = "pending", createdAt, updatedAt }) {
    if (!userId) throw new Error("userId requerido");
    if (!Array.isArray(items) || items.length === 0) throw new Error("El carrito está vacío");
    if (typeof total !== "number" || total < 0) throw new Error("Total inválido");
    if (!shipping) throw new Error("Shipping requerido");
    if (!STATUSES.includes(status)) throw new Error("Status inválido");
    this.id = id ?? null;
    this.userId = userId;
    this.items = items;
    this.total = total;
    this.shipping = shipping;
    this.status = status;
    this.createdAt = createdAt ?? null;
    this.updatedAt = updatedAt ?? null;
  }

  confirm() {
    if (this.status !== "pending") throw new Error("Solo órdenes pendientes se pueden confirmar");
    this.status = "confirmed";
  }
  cancel() {
    if (this.status === "cancelled") return false;
    if (this.status === "shipped" || this.status === "delivered") {
      throw new Error("No se puede cancelar una orden ya enviada");
    }
    this.status = "cancelled";
    return true;
  }
  isCancelled() { return this.status === "cancelled"; }
  changeStatus(next) {
    if (!STATUSES.includes(next)) throw new Error("Status inválido");
    this.status = next;
  }
  belongsTo(userId) { return this.userId === userId; }

  static validStatuses() { return [...STATUSES]; }
}

module.exports = { Order, STATUSES };

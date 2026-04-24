class Payment {
  constructor({ id, orderId, userId, amount, cardLast4, status, transactionId = "", message = "", createdAt }) {
    if (!orderId) throw new Error("orderId requerido");
    if (!userId) throw new Error("userId requerido");
    if (typeof amount !== "number" || amount < 0) throw new Error("Monto inválido");
    if (!["approved", "rejected"].includes(status)) throw new Error("Status inválido");
    this.id = id ?? null;
    this.orderId = orderId;
    this.userId = userId;
    this.amount = amount;
    this.cardLast4 = cardLast4;
    this.status = status;
    this.transactionId = transactionId;
    this.message = message;
    this.createdAt = createdAt ?? null;
  }
  isApproved() { return this.status === "approved"; }
}
module.exports = { Payment };

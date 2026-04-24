const { Payment } = require("../../domain/entities/Payment");
const { OutboxEvent } = require("../../domain/entities/OutboxEvent");

class ProcessPayment {
  constructor({ paymentRepository, paymentGateway, orderClient, outboxRepository }) {
    this.paymentRepository = paymentRepository;
    this.paymentGateway = paymentGateway;
    this.orderClient = orderClient;
    this.outboxRepository = outboxRepository;
  }

  async execute({ orderId, userId, cardNumber, cardHolder, authHeader }) {
    if (!orderId) throw new Error("orderId requerido");

    const order = await this.orderClient.getOrder(orderId, authHeader);
    if (!order) throw new Error("Orden no encontrada");

    const result = await this.paymentGateway.charge({
      amount: order.total,
      cardNumber,
      cardHolder,
    });

    const cleanCard = (cardNumber || "").replace(/\s/g, "");
    const payment = new Payment({
      orderId,
      userId,
      amount: order.total,
      cardLast4: cleanCard.slice(-4),
      status: result.success ? "approved" : "rejected",
      transactionId: result.transactionId,
      message: result.message,
    });

    const saved = await this.paymentRepository.save(payment);

    const event = new OutboxEvent({
      type: saved.isApproved() ? "payment.approved" : "payment.failed",
      payload: {
        orderId: saved.orderId,
        paymentId: saved.id,
        userId: saved.userId,
        amount: saved.amount,
        transactionId: saved.transactionId,
        reason: saved.isApproved() ? null : saved.message,
      },
    });
    await this.outboxRepository.save(event);

    return saved;
  }
}

module.exports = { ProcessPayment };

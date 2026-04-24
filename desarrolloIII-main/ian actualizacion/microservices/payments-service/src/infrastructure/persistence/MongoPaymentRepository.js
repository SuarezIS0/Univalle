const { PaymentRepository } = require("../../domain/repositories/PaymentRepository");
const { Payment } = require("../../domain/entities/Payment");
const PaymentModel = require("./PaymentModel");

function toDomain(doc) {
  if (!doc) return null;
  return new Payment({
    id: doc._id.toString(),
    orderId: doc.orderId,
    userId: doc.userId,
    amount: doc.amount,
    cardLast4: doc.cardLast4,
    status: doc.status,
    transactionId: doc.transactionId,
    message: doc.message,
    createdAt: doc.createdAt,
  });
}

class MongoPaymentRepository extends PaymentRepository {
  async save(payment) {
    const created = await PaymentModel.create({
      orderId: payment.orderId,
      userId: payment.userId,
      amount: payment.amount,
      cardLast4: payment.cardLast4,
      status: payment.status,
      transactionId: payment.transactionId,
      message: payment.message,
    });
    return toDomain(created);
  }
  async findByOrder(orderId) {
    return (await PaymentModel.find({ orderId })).map(toDomain);
  }
}

module.exports = { MongoPaymentRepository };

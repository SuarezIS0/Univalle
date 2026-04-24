function view(p) {
  return {
    _id: p.id,
    orderId: p.orderId,
    userId: p.userId,
    amount: p.amount,
    cardLast4: p.cardLast4,
    status: p.status,
    transactionId: p.transactionId,
    message: p.message,
    createdAt: p.createdAt,
  };
}

class PaymentController {
  constructor({ processPayment, listPaymentsByOrder }) {
    this.processPayment = processPayment;
    this.listPaymentsByOrder = listPaymentsByOrder;
  }

  create = async (req, res) => {
    try {
      const payment = await this.processPayment.execute({
        orderId: req.body.orderId,
        userId: req.user.id,
        cardNumber: req.body.cardNumber,
        cardHolder: req.body.cardHolder,
        authHeader: req.headers.authorization,
      });
      const approved = payment.isApproved();
      res.status(approved ? 200 : 402).json({
        success: approved,
        data: {
          success: approved,
          transactionId: payment.transactionId,
          message: payment.message,
          paymentId: payment.id,
        },
      });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
  };

  listByOrder = async (req, res) => {
    try {
      const list = await this.listPaymentsByOrder.execute({ orderId: req.params.orderId });
      res.json({ success: true, data: list.map(view) });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  };
}

module.exports = { PaymentController };

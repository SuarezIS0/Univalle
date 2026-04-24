const { PaymentGateway } = require("../../domain/services/PaymentGateway");

class SimulatedPaymentGateway extends PaymentGateway {
  async charge({ amount, cardNumber, cardHolder }) {
    const clean = (cardNumber || "").replace(/\s/g, "");
    if (clean.length < 12)
      return { success: false, transactionId: "", message: "Número de tarjeta inválido" };
    if (!cardHolder || cardHolder.trim().length < 3)
      return { success: false, transactionId: "", message: "Titular inválido" };
    if (amount <= 0)
      return { success: false, transactionId: "", message: "Monto inválido" };

    const lastDigit = parseInt(clean.slice(-1), 10);
    const success = Number.isFinite(lastDigit) && lastDigit % 2 === 0;

    return {
      success,
      transactionId: success ? `SIM-${Date.now()}` : "",
      message: success ? "Pago aprobado (simulado)" : "Pago rechazado por el banco (simulado)",
    };
  }
}

module.exports = { SimulatedPaymentGateway };

import {
  PaymentGateway,
  PaymentRequest,
  PaymentResult,
} from "@/domain/services/PaymentGateway";

export class SimulatedPaymentGateway implements PaymentGateway {
  async charge(req: PaymentRequest): Promise<PaymentResult> {
    if (!req.cardNumber || req.cardNumber.replace(/\s/g, "").length < 12) {
      return {
        success: false,
        transactionId: "",
        message: "Número de tarjeta inválido",
      };
    }
    if (!req.cardHolder || req.cardHolder.trim().length < 3) {
      return {
        success: false,
        transactionId: "",
        message: "Titular inválido",
      };
    }
    if (req.amount <= 0) {
      return {
        success: false,
        transactionId: "",
        message: "Monto inválido",
      };
    }

    const lastDigit = parseInt(req.cardNumber.slice(-1), 10);
    const success = Number.isFinite(lastDigit) && lastDigit % 2 === 0;

    return {
      success,
      transactionId: success ? `SIM-${Date.now()}` : "",
      message: success
        ? "Pago aprobado (simulado)"
        : "Pago rechazado por el banco (simulado)",
    };
  }
}

import { OrderRepository } from "@/domain/repositories/OrderRepository";
import {
  PaymentGateway,
  PaymentResult,
} from "@/domain/services/PaymentGateway";

export type ProcessPaymentDTO = {
  orderId: string;
  cardNumber: string;
  cardHolder: string;
};

export class ProcessPayment {
  constructor(
    private orderRepository: OrderRepository,
    private paymentGateway: PaymentGateway
  ) {}

  async execute(data: ProcessPaymentDTO): Promise<PaymentResult> {
    const order = await this.orderRepository.findById(data.orderId);
    if (!order) throw new Error("Orden no encontrada");
    if (order.status !== "pending") {
      throw new Error("La orden no está pendiente de pago");
    }

    const result = await this.paymentGateway.charge({
      orderId: order.id,
      amount: order.total,
      cardNumber: data.cardNumber,
      cardHolder: data.cardHolder,
    });

    if (result.success) {
      await this.orderRepository.updateStatus(order.id, "confirmed");
    } else {
      await this.orderRepository.updateStatus(order.id, "cancelled");
    }
    return result;
  }
}

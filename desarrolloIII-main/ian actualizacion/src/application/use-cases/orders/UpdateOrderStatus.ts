import { Order, OrderStatus } from "@/domain/entities/Order";
import { OrderRepository } from "@/domain/repositories/OrderRepository";

export class UpdateOrderStatus {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string, next: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");
    order.changeStatus(next);
    const updated = await this.orderRepository.updateStatus(id, next);
    if (!updated) throw new Error("No se pudo actualizar la orden");
    return updated;
  }
}

import { Order } from "@/domain/entities/Order";
import { OrderRepository } from "@/domain/repositories/OrderRepository";

export class GetOrderById {
  constructor(private orderRepository: OrderRepository) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new Error("Orden no encontrada");
    return order;
  }
}

import { Order } from "@/domain/entities/Order";
import { OrderRepository } from "@/domain/repositories/OrderRepository";

export class GetOrders {
  constructor(private orderRepository: OrderRepository) {}

  async execute(userId?: string): Promise<Order[]> {
    if (userId) return this.orderRepository.findByUserId(userId);
    return this.orderRepository.findAll();
  }
}

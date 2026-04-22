import { Order, OrderStatus } from "../entities/Order";

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  findAll(): Promise<Order[]>;
  findByUserId(userId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>;
}

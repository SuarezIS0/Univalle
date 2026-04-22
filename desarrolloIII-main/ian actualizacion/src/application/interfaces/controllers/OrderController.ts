import { MongoOrderRepository } from "@/application/infrastructure/database/repositories/MongoOrderRepository";
import { MongoProductRepository } from "@/application/infrastructure/database/repositories/MongoProductRepository";
import { SimulatedPaymentGateway } from "@/application/infrastructure/services/SimulatedPaymentGateway";
import {
  CreateOrder,
  CreateOrderDTO,
} from "@/application/use-cases/orders/CreateOrder";
import { GetOrders } from "@/application/use-cases/orders/GetOrders";
import { GetOrderById } from "@/application/use-cases/orders/GetOrderById";
import { UpdateOrderStatus } from "@/application/use-cases/orders/UpdateOrderStatus";
import {
  ProcessPayment,
  ProcessPaymentDTO,
} from "@/application/use-cases/payments/ProcessPayment";
import { OrderStatus } from "@/domain/entities/Order";

function orderRepo() {
  return new MongoOrderRepository();
}
function productRepo() {
  return new MongoProductRepository();
}
function paymentGateway() {
  return new SimulatedPaymentGateway();
}

export class OrderController {
  static async create(data: CreateOrderDTO) {
    return new CreateOrder(orderRepo(), productRepo()).execute(data);
  }

  static async getAll(userId?: string) {
    return new GetOrders(orderRepo()).execute(userId);
  }

  static async getById(id: string) {
    return new GetOrderById(orderRepo()).execute(id);
  }

  static async updateStatus(id: string, status: OrderStatus) {
    return new UpdateOrderStatus(orderRepo()).execute(id, status);
  }

  static async pay(data: ProcessPaymentDTO) {
    return new ProcessPayment(orderRepo(), paymentGateway()).execute(data);
  }
}

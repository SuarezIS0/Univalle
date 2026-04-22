import {
  Order,
  OrderItem,
  ShippingInfo,
} from "@/domain/entities/Order";
import { OrderRepository } from "@/domain/repositories/OrderRepository";
import { ProductRepository } from "@/domain/repositories/ProductRepository";

export type CreateOrderDTO = {
  userId: string;
  items: { productId: string; quantity: number }[];
  shipping: ShippingInfo;
};

export class CreateOrder {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository
  ) {}

  async execute(data: CreateOrderDTO): Promise<Order> {
    if (!data.items || data.items.length === 0) {
      throw new Error("El carrito está vacío");
    }

    const enriched: OrderItem[] = [];
    let total = 0;

    for (const line of data.items) {
      const product = await this.productRepository.findById(line.productId);
      if (!product) {
        throw new Error(`Producto no encontrado: ${line.productId}`);
      }
      if (!product.hasStock(line.quantity)) {
        throw new Error(`Stock insuficiente: ${product.name}`);
      }

      enriched.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: line.quantity,
        image: product.image,
      });
      total += product.price * line.quantity;

      product.reduceStock(line.quantity);
      await this.productRepository.update(product.id, { stock: product.stock });
    }

    const order = new Order(
      crypto.randomUUID(),
      data.userId,
      enriched,
      total,
      data.shipping,
      "pending"
    );
    return this.orderRepository.save(order);
  }
}

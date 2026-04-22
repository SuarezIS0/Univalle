import { Order, OrderStatus } from "@/domain/entities/Order";
import { OrderRepository } from "@/domain/repositories/OrderRepository";
import { OrderModel } from "../models/OrderModel";

function toDomain(doc: any): Order {
  return new Order(
    doc._id.toString(),
    doc.userId,
    doc.items.map((i: any) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    doc.total,
    {
      fullName: doc.shipping.fullName,
      address: doc.shipping.address,
      city: doc.shipping.city,
      phone: doc.shipping.phone,
    },
    doc.status as OrderStatus,
    doc.createdAt ?? new Date()
  );
}

export class MongoOrderRepository implements OrderRepository {
  async save(order: Order): Promise<Order> {
    const doc = await OrderModel.create({
      userId: order.userId,
      items: order.items,
      total: order.total,
      shipping: order.shipping,
      status: order.status,
    });
    return toDomain(doc);
  }

  async findAll(): Promise<Order[]> {
    const docs = await OrderModel.find({}).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(toDomain);
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const doc = await OrderModel.findById(id);
      return doc ? toDomain(doc) : null;
    } catch {
      return null;
    }
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    return doc ? toDomain(doc) : null;
  }
}

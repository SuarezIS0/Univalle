const { OrderRepository } = require("../../domain/repositories/OrderRepository");
const { Order } = require("../../domain/entities/Order");
const OrderModel = require("./OrderModel");

function toDomain(doc) {
  if (!doc) return null;
  return new Order({
    id: doc._id.toString(),
    userId: doc.userId,
    items: doc.items.map((i) => ({ ...i.toObject?.() ?? i })),
    total: doc.total,
    shipping: doc.shipping.toObject ? doc.shipping.toObject() : doc.shipping,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

class MongoOrderRepository extends OrderRepository {
  async save(order) {
    const created = await OrderModel.create({
      userId: order.userId,
      items: order.items,
      total: order.total,
      shipping: order.shipping,
      status: order.status,
    });
    return toDomain(created);
  }
  async findById(id) {
    try { return toDomain(await OrderModel.findById(id)); }
    catch { return null; }
  }
  async findAll() {
    return (await OrderModel.find().sort({ createdAt: -1 })).map(toDomain);
  }
  async findByUser(userId) {
    return (await OrderModel.find({ userId }).sort({ createdAt: -1 })).map(toDomain);
  }
  async update(id, changes) {
    return toDomain(await OrderModel.findByIdAndUpdate(id, changes, { new: true }));
  }
  async countByStatus(status) {
    return OrderModel.countDocuments({ status });
  }
  async findWithStatusIn(statuses) {
    return (await OrderModel.find({ status: { $in: statuses } })).map(toDomain);
  }
}

module.exports = { MongoOrderRepository };

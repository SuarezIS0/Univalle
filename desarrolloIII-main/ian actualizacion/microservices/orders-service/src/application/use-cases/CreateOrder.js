const { Order } = require("../../domain/entities/Order");

class CreateOrder {
  constructor({ orderRepository, productCatalog }) {
    this.orderRepository = orderRepository;
    this.productCatalog = productCatalog;
  }

  async execute({ userId, items, shipping }) {
    if (!items || items.length === 0) throw new Error("El carrito está vacío");

    const enriched = [];
    let total = 0;

    for (const line of items) {
      const product = await this.productCatalog.getProduct(line.productId);
      if (!product) throw new Error(`Producto no encontrado: ${line.productId}`);
      if (product.stock < line.quantity) throw new Error(`Stock insuficiente: ${product.name}`);

      await this.productCatalog.reduceStock(line.productId, line.quantity);

      enriched.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: line.quantity,
        image: product.image?.url || "",
      });
      total += product.price * line.quantity;
    }

    const order = new Order({ userId, items: enriched, total, shipping, status: "pending" });
    return this.orderRepository.save(order);
  }
}

module.exports = { CreateOrder };

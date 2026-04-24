const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MongoOrderRepository } = require("./infrastructure/persistence/MongoOrderRepository");
const { MongoOutboxRepository } = require("./infrastructure/persistence/MongoOutboxRepository");
const { MongoProcessedEventStore } = require("./infrastructure/persistence/MongoProcessedEventStore");
const { HttpProductCatalog } = require("./infrastructure/services/HttpProductCatalog");
const { JwtTokenService } = require("./infrastructure/services/JwtTokenService");
const { RabbitMQEventPublisher } = require("./infrastructure/messaging/RabbitMQEventPublisher");
const { RabbitMQEventSubscriber } = require("./infrastructure/messaging/RabbitMQEventSubscriber");
const { OutboxRelay } = require("./infrastructure/messaging/OutboxRelay");
const { CreateOrder } = require("./application/use-cases/CreateOrder");
const { ListOrders } = require("./application/use-cases/ListOrders");
const { GetOrder } = require("./application/use-cases/GetOrder");
const { UpdateOrderStatus } = require("./application/use-cases/UpdateOrderStatus");
const { ConfirmOrder } = require("./application/use-cases/ConfirmOrder");
const { CancelOrder } = require("./application/use-cases/CancelOrder");
const { GetMetrics } = require("./application/use-cases/GetMetrics");
const { HandlePaymentApproved } = require("./application/use-cases/HandlePaymentApproved");
const { HandlePaymentFailed } = require("./application/use-cases/HandlePaymentFailed");
const { OrderController } = require("./interfaces/http/OrderController");
const { buildAuthMiddleware } = require("./interfaces/http/middlewares/auth");
const { buildRouter } = require("./interfaces/http/routes");

const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/orders";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret-univalle-ecommerce-2026";
const PRODUCTS_URL = process.env.PRODUCTS_URL || "http://localhost:3003";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

async function bootstrap() {
  await mongoose.connect(MONGO_URI);

  const orderRepository = new MongoOrderRepository();
  const outboxRepository = new MongoOutboxRepository();
  const processedEventStore = new MongoProcessedEventStore();
  const productCatalog = new HttpProductCatalog({ baseUrl: PRODUCTS_URL });
  const tokenService = new JwtTokenService({ secret: JWT_SECRET });

  const publisher = new RabbitMQEventPublisher({ url: RABBITMQ_URL });
  await publisher.connect();
  const relay = new OutboxRelay({ outboxRepository, publisher });
  relay.start();

  const confirmOrder = new ConfirmOrder({ orderRepository });
  const cancelOrder = new CancelOrder({ orderRepository, outboxRepository });

  const handlePaymentApproved = new HandlePaymentApproved({ confirmOrder, processedEventStore });
  const handlePaymentFailed = new HandlePaymentFailed({ cancelOrder, processedEventStore });

  const subscriber = new RabbitMQEventSubscriber({
    url: RABBITMQ_URL,
    queueName: "orders.payment-events",
  });
  await subscriber.connect();
  await subscriber.subscribe("payment.approved", (e) => handlePaymentApproved.execute(e));
  await subscriber.subscribe("payment.failed", (e) => handlePaymentFailed.execute(e));
  await subscriber.start();

  const controller = new OrderController({
    createOrder: new CreateOrder({ orderRepository, productCatalog }),
    listOrders: new ListOrders({ orderRepository }),
    getOrder: new GetOrder({ orderRepository }),
    updateOrderStatus: new UpdateOrderStatus({ orderRepository }),
    confirmOrder,
    getMetrics: new GetMetrics({ orderRepository }),
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/", buildRouter({ controller, authMiddleware: buildAuthMiddleware(tokenService) }));
  app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[orders] error global", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de órdenes" });
  });

  app.listen(PORT, () => console.log(`[orders] hexagonal + saga :${PORT}`));
}

bootstrap().catch((e) => { console.error(e); process.exit(1); });

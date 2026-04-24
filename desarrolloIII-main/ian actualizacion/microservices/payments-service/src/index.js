const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MongoPaymentRepository } = require("./infrastructure/persistence/MongoPaymentRepository");
const { MongoOutboxRepository } = require("./infrastructure/persistence/MongoOutboxRepository");
const { SimulatedPaymentGateway } = require("./infrastructure/services/SimulatedPaymentGateway");
const { HttpOrderClient } = require("./infrastructure/services/HttpOrderClient");
const { JwtTokenService } = require("./infrastructure/services/JwtTokenService");
const { RabbitMQEventPublisher } = require("./infrastructure/messaging/RabbitMQEventPublisher");
const { OutboxRelay } = require("./infrastructure/messaging/OutboxRelay");
const { ProcessPayment } = require("./application/use-cases/ProcessPayment");
const { ListPaymentsByOrder } = require("./application/use-cases/ListPaymentsByOrder");
const { PaymentController } = require("./interfaces/http/PaymentController");
const { buildAuthMiddleware } = require("./interfaces/http/middlewares/auth");
const { buildRouter } = require("./interfaces/http/routes");

const PORT = process.env.PORT || 3005;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/payments";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret-univalle-ecommerce-2026";
const ORDERS_URL = process.env.ORDERS_URL || "http://localhost:3004";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

async function bootstrap() {
  await mongoose.connect(MONGO_URI);

  const paymentRepository = new MongoPaymentRepository();
  const outboxRepository = new MongoOutboxRepository();
  const paymentGateway = new SimulatedPaymentGateway();
  const orderClient = new HttpOrderClient({ baseUrl: ORDERS_URL });
  const tokenService = new JwtTokenService({ secret: JWT_SECRET });

  const publisher = new RabbitMQEventPublisher({ url: RABBITMQ_URL });
  await publisher.connect();
  const relay = new OutboxRelay({ outboxRepository, publisher });
  relay.start();

  const controller = new PaymentController({
    processPayment: new ProcessPayment({ paymentRepository, paymentGateway, orderClient, outboxRepository }),
    listPaymentsByOrder: new ListPaymentsByOrder({ paymentRepository }),
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/", buildRouter({ controller, authMiddleware: buildAuthMiddleware(tokenService) }));
  app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[payments] error global", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de pagos" });
  });

  app.listen(PORT, () => console.log(`[payments] hexagonal + saga :${PORT}`));
}

bootstrap().catch((e) => { console.error(e); process.exit(1); });

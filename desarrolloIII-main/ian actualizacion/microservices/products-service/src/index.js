const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MongoProductRepository } = require("./infrastructure/persistence/MongoProductRepository");
const { MongoProcessedEventStore } = require("./infrastructure/persistence/MongoProcessedEventStore");
const { JwtTokenService } = require("./infrastructure/services/JwtTokenService");
const { RabbitMQEventSubscriber } = require("./infrastructure/messaging/RabbitMQEventSubscriber");
const { ListProducts } = require("./application/use-cases/ListProducts");
const { GetProduct } = require("./application/use-cases/GetProduct");
const { CreateProduct } = require("./application/use-cases/CreateProduct");
const { UpdateProduct } = require("./application/use-cases/UpdateProduct");
const { ArchiveProduct } = require("./application/use-cases/ArchiveProduct");
const { ReduceStock } = require("./application/use-cases/ReduceStock");
const { ReleaseStock } = require("./application/use-cases/ReleaseStock");
const { SeedProducts } = require("./application/use-cases/SeedProducts");
const { HandleOrderCancelled } = require("./application/use-cases/HandleOrderCancelled");
const { ProductController } = require("./interfaces/http/ProductController");
const { buildRequireAdmin } = require("./interfaces/http/middlewares/auth");
const { buildRouter } = require("./interfaces/http/routes");

const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/products";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret-univalle-ecommerce-2026";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

async function connectRabbitWithRetry(subscriber, retries = 10, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await subscriber.connect();
      await subscriber.subscribe("order.cancelled", (e) => handleOrderCancelled.execute(e));
      await subscriber.start();
      console.log("[products] Conectado a RabbitMQ");
      return;
    } catch (err) {
      console.error(`[products] RabbitMQ intento ${i}/${retries} falló`, err.message);
      if (i === retries) {
        console.error("[products] No se pudo conectar a RabbitMQ, arrancando sin eventos");
        return;
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

async function bootstrap() {
  await mongoose.connect(MONGO_URI);

  const productRepository = new MongoProductRepository();
  const processedEventStore = new MongoProcessedEventStore();
  const tokenService = new JwtTokenService({ secret: JWT_SECRET });

  const releaseStock = new ReleaseStock({ productRepository });
  const handleOrderCancelled = new HandleOrderCancelled({ releaseStock, processedEventStore });

  const subscriber = new RabbitMQEventSubscriber({
    url: RABBITMQ_URL,
    queueName: "products.order-events",
  });

  // Conexión con reintentos
  await connectRabbitWithRetry(subscriber);

  const controller = new ProductController({
    listProducts: new ListProducts({ productRepository }),
    getProduct: new GetProduct({ productRepository }),
    createProduct: new CreateProduct({ productRepository }),
    updateProduct: new UpdateProduct({ productRepository }),
    archiveProduct: new ArchiveProduct({ productRepository }),
    reduceStock: new ReduceStock({ productRepository }),
    seedProducts: new SeedProducts({ productRepository }),
    countProducts: () => productRepository.count(),
  });

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));
  app.use("/", buildRouter({ controller, requireAdmin: buildRequireAdmin(tokenService) }));
  app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));
  app.use((err, _req, res, _next) => {
    console.error("[products] error global", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de productos" });
  });

  app.listen(PORT, () => console.log(`[products] hexagonal + saga :${PORT}`));
}

bootstrap().catch((e) => { console.error(e); process.exit(1); });

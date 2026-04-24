/**
 * Composition Root (SOLID-D).
 * Aquí y solo aquí se cablean las implementaciones concretas a los puertos.
 * El dominio y los casos de uso no saben de mongoose, bcrypt ni jwt.
 */
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MongoUserRepository } = require("./infrastructure/persistence/MongoUserRepository");
const { BcryptHasher } = require("./infrastructure/services/BcryptHasher");
const { JwtTokenService } = require("./infrastructure/services/JwtTokenService");
const { RegisterUser } = require("./application/use-cases/RegisterUser");
const { LoginUser } = require("./application/use-cases/LoginUser");
const { VerifyToken } = require("./application/use-cases/VerifyToken");
const { AuthController } = require("./interfaces/http/AuthController");
const { buildRouter } = require("./interfaces/http/routes");

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/auth";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret-univalle-ecommerce-2026";

async function bootstrap() {
  await mongoose.connect(MONGO_URI);

  const userRepository = new MongoUserRepository();
  const hasher = new BcryptHasher();
  const tokenService = new JwtTokenService({ secret: JWT_SECRET });

  const registerUser = new RegisterUser({ userRepository, hasher });
  const loginUser = new LoginUser({ userRepository, hasher, tokenService });
  const verifyToken = new VerifyToken({ tokenService });

  const controller = new AuthController({ registerUser, loginUser, verifyToken });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/", buildRouter(controller));
  app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[auth] error global", err);
    if (res.headersSent) return;
    res.status(500).json({ error: "Error interno del servicio de auth" });
  });

  app.listen(PORT, () => console.log(`[auth] hexagonal :${PORT}`));
}

bootstrap().catch((e) => {
  console.error("Bootstrap error:", e);
  process.exit(1);
});

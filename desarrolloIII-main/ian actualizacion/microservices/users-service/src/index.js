const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { MongoUserRepository } = require("./infrastructure/persistence/MongoUserRepository");
const { JwtTokenService } = require("./infrastructure/services/JwtTokenService");
const { ListUsers } = require("./application/use-cases/ListUsers");
const { GetUser } = require("./application/use-cases/GetUser");
const { UpdateUser } = require("./application/use-cases/UpdateUser");
const { DeleteUser } = require("./application/use-cases/DeleteUser");
const { PromoteToAdmin } = require("./application/use-cases/PromoteToAdmin");
const { UserController } = require("./interfaces/http/UserController");
const { buildAuthMiddleware } = require("./interfaces/http/middlewares/auth");
const { buildRouter } = require("./interfaces/http/routes");

const PORT = process.env.PORT || 3002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/users";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret-univalle-ecommerce-2026";
const PROMOTE_SECRET = process.env.ADMIN_PROMOTE_SECRET || "univalle-admin-seed";

async function bootstrap() {
  await mongoose.connect(MONGO_URI);

  const userRepository = new MongoUserRepository();
  const tokenService = new JwtTokenService({ secret: JWT_SECRET });

  const controller = new UserController({
    listUsers: new ListUsers({ userRepository }),
    getUser: new GetUser({ userRepository }),
    updateUser: new UpdateUser({ userRepository }),
    deleteUser: new DeleteUser({ userRepository }),
    promoteToAdmin: new PromoteToAdmin({ userRepository, promoteSecret: PROMOTE_SECRET }),
    countUsers: () => userRepository.count(),
  });

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/", buildRouter({ controller, authMiddleware: buildAuthMiddleware(tokenService) }));
  app.use((_req, res) => res.status(404).json({ success: false, error: "Ruta no encontrada" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error("[users] error global", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de usuarios" });
  });

  app.listen(PORT, () => console.log(`[users] hexagonal :${PORT}`));
}

bootstrap().catch((e) => { console.error(e); process.exit(1); });

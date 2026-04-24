const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const PORT = process.env.PORT || 8080;
const AUTH_URL = process.env.AUTH_URL || "http://localhost:3001";
const USERS_URL = process.env.USERS_URL || "http://localhost:3002";
const PRODUCTS_URL = process.env.PRODUCTS_URL || "http://localhost:3003";
const ORDERS_URL = process.env.ORDERS_URL || "http://localhost:3004";
const PAYMENTS_URL = process.env.PAYMENTS_URL || "http://localhost:3005";

const app = express();
app.use(cors());

app.get("/health", (_, res) =>
  res.json({ ok: true, service: "gateway", routes: ["auth", "users", "products", "orders", "payments"] })
);

function jsonProxyError(serviceName) {
  return (err, req, res) => {
    const code = err && err.code === "ECONNREFUSED" ? 503 : 502;
    const message =
      code === 503
        ? `${serviceName} no disponible`
        : `Error al contactar ${serviceName}: ${err.message}`;
    console.error(
      `[gateway] proxy error → ${serviceName} ${req.method} ${req.originalUrl}: ${err.code || err.message}`
    );
    if (res.headersSent) return;
    res.status(code).json({ success: false, error: message });
  };
}

function buildProxy({ target, name, pathRewrite }) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    onError: jsonProxyError(name),
  });
}

app.use("/api/auth", buildProxy({
  target: AUTH_URL, name: "auth-service",
  pathRewrite: { "^/api/auth": "" },
}));
app.use("/api/users", buildProxy({
  target: USERS_URL, name: "users-service",
  pathRewrite: { "^/api": "" },
}));
app.use("/api/admin/promote", buildProxy({
  target: USERS_URL, name: "users-service",
  pathRewrite: { "^/api": "" },
}));
app.use("/api/products", buildProxy({
  target: PRODUCTS_URL, name: "products-service",
  pathRewrite: { "^/api": "" },
}));
app.use("/api/orders", buildProxy({
  target: ORDERS_URL, name: "orders-service",
  pathRewrite: { "^/api": "" },
}));
app.use("/api/admin/metrics", buildProxy({
  target: ORDERS_URL, name: "orders-service",
  pathRewrite: { "^/api": "" },
}));
app.use("/api/payments", buildProxy({
  target: PAYMENTS_URL, name: "payments-service",
  pathRewrite: { "^/api": "" },
}));

// 404 JSON para cualquier ruta /api/* no mapeada
app.use("/api", (_req, res) =>
  res.status(404).json({ success: false, error: "Ruta no encontrada" })
);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[gateway] unhandled", err);
  if (res.headersSent) return;
  res.status(500).json({ success: false, error: "Error interno del gateway" });
});

app.listen(PORT, () => console.log(`[gateway] :${PORT}`));
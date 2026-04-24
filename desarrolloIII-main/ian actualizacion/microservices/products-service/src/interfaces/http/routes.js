const { Router } = require("express");

function buildRouter({ controller, requireAdmin }) {
  const r = Router();
  r.get("/health", (_, res) => res.json({ ok: true, service: "products" }));

  r.get("/products", controller.list);
  r.get("/products/:id", controller.getById);
  r.post("/products", requireAdmin, controller.create);
  r.put("/products/:id", requireAdmin, controller.update);
  r.delete("/products/:id", requireAdmin, controller.archive);

  // Internal endpoint (invocado por orders-service)
  r.post("/products/:id/reduce-stock", controller.reduceStockHandler);

  r.post("/products/seed", controller.seed);
  r.get("/admin/count", controller.count);
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    console.error("[products] unhandled", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de productos" });
  });
  return r;
}

module.exports = { buildRouter };

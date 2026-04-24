const { Router } = require("express");
const { requireAdmin } = require("./middlewares/auth");

function buildRouter({ controller, authMiddleware }) {
  const r = Router();
  r.get("/health", (_, res) => res.json({ ok: true, service: "orders" }));

  r.get("/orders", authMiddleware, controller.list);
  r.get("/orders/:id", authMiddleware, controller.getById);
  r.post("/orders", authMiddleware, controller.create);
  r.put("/orders/:id", authMiddleware, requireAdmin, controller.updateStatus);

  // Internal (invocado por payments-service)
  r.post("/orders/:id/confirm", controller.confirm);

  r.get("/admin/metrics", authMiddleware, requireAdmin, controller.metrics);
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    console.error("[orders] unhandled", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de órdenes" });
  });
  return r;
}

module.exports = { buildRouter };

const { Router } = require("express");

function buildRouter({ controller, authMiddleware }) {
  const r = Router();
  r.get("/health", (_, res) => res.json({ ok: true, service: "payments" }));
  r.post("/payments", authMiddleware, controller.create);
  r.get("/payments/order/:orderId", authMiddleware, controller.listByOrder);
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    console.error("[payments] unhandled", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de pagos" });
  });
  return r;
}

module.exports = { buildRouter };

const { Router } = require("express");

function buildRouter({ controller, authMiddleware }) {
  const r = Router();
  r.get("/health", (_, res) => res.json({ ok: true, service: "users" }));

  r.get("/users", authMiddleware, controller.list);
  r.get("/users/:id", authMiddleware, controller.getById);
  r.put("/users/:id", authMiddleware, controller.update);
  r.delete("/users/:id", authMiddleware, controller.remove);

  r.post("/admin/promote", controller.promote);
  r.get("/admin/count", authMiddleware, controller.count);
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    console.error("[users] unhandled", err);
    if (res.headersSent) return;
    res.status(500).json({ success: false, error: "Error interno del servicio de usuarios" });
  });
  return r;
}

module.exports = { buildRouter };

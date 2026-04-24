const { Router } = require("express");

function buildRouter(controller) {
  const r = Router();
  r.get("/health", (_, res) => res.json({ ok: true, service: "auth" }));
  r.post("/register", controller.register);
  r.post("/login", controller.login);
  r.post("/verify", controller.verify);
  // eslint-disable-next-line no-unused-vars
  r.use((err, _req, res, _next) => {
    console.error("[auth] unhandled", err);
    if (res.headersSent) return;
    res.status(500).json({ error: "Error interno del servicio de auth" });
  });
  return r;
}

module.exports = { buildRouter };

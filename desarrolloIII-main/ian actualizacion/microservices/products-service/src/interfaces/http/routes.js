const express = require("express");
const { Router } = require("express");

function buildRouter({ controller, requireAdmin, upload, uploadsDir }) {
  const r = Router();
  r.get("/health", (_, res) => res.json({ ok: true, service: "products" }));

  // Static + upload deben ir ANTES de /products/:id para que ":id" no capture "uploads" o "upload".
  r.use("/products/uploads", express.static(uploadsDir));
  r.post(
    "/products/upload",
    requireAdmin,
    upload.single("file"),
    (req, res) => {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "Archivo requerido" });
      }
      const url = `/api/products/uploads/${req.file.filename}`;
      res.status(201).json({
        success: true,
        data: { url, storageKey: req.file.filename },
      });
    }
  );

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
    const status = err && err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ success: false, error: err.message || "Error interno" });
  });
  return r;
}

module.exports = { buildRouter };

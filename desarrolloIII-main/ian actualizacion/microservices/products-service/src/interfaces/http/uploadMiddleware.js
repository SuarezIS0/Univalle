const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function buildUploadMiddleware({ uploadsDir }) {
  fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".png";
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME.has(file.mimetype)) {
        return cb(new Error("Formato no permitido. Usa PNG, JPG o WEBP."));
      }
      cb(null, true);
    },
  });
}

module.exports = { buildUploadMiddleware };

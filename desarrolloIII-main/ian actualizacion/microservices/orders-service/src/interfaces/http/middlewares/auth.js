function buildAuthMiddleware(tokenService) {
  return function authenticate(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ success: false, error: "Token requerido" });
    const payload = tokenService.verify(token);
    if (!payload) return res.status(401).json({ success: false, error: "Token inválido" });
    req.user = payload;
    next();
  };
}
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin")
    return res.status(403).json({ success: false, error: "Solo administradores" });
  next();
}
module.exports = { buildAuthMiddleware, requireAdmin };

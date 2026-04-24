function buildRequireAdmin(tokenService) {
  return function requireAdmin(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ success: false, error: "Token requerido" });
    const payload = tokenService.verify(token);
    if (!payload) return res.status(401).json({ success: false, error: "Token inválido" });
    if (payload.role !== "admin")
      return res.status(403).json({ success: false, error: "Solo administradores" });
    req.user = payload;
    next();
  };
}
module.exports = { buildRequireAdmin };

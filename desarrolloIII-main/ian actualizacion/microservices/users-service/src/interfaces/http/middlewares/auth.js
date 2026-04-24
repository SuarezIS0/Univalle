function buildAuthMiddleware(tokenService) {
  return function authenticate(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Token requerido" });
    const payload = tokenService.verify(token);
    if (!payload) return res.status(401).json({ error: "Token inválido" });
    req.user = payload;
    next();
  };
}
module.exports = { buildAuthMiddleware };

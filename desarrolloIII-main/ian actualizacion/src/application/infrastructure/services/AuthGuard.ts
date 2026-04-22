import { JwtService, JwtPayload } from "./JwtService";

export type AuthResult =
  | { ok: true; payload: JwtPayload }
  | { ok: false; status: 401 | 403; message: string };

export function authenticate(req: Request): AuthResult {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return { ok: false, status: 401, message: "Token requerido" };
  }

  const payload = JwtService.verify(token);
  if (!payload) {
    return { ok: false, status: 401, message: "Token inválido" };
  }

  return { ok: true, payload };
}

export function requireAdmin(req: Request): AuthResult {
  const result = authenticate(req);
  if (!result.ok) return result;
  if (result.payload.role !== "admin") {
    return { ok: false, status: 403, message: "Solo administradores" };
  }
  return result;
}

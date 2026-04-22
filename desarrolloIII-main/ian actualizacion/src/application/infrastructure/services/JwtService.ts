import jwt from "jsonwebtoken";

export type JwtPayload = {
  email: string;
  id?: string;
  role?: "customer" | "admin";
};

const SECRET = process.env.JWT_SECRET || "supersecret-univalle-ecommerce-2026";

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    console.error("Token inválido:", error);
    return null;
  }
}

export class JwtService {
  static generate(payload: JwtPayload): string {
    return generateToken(payload);
  }

  static verify(token: string): JwtPayload | null {
    return verifyToken(token);
  }
}

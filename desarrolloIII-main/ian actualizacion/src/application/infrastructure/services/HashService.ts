import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export class HashService {
  static async hash(password: string): Promise<string> {
    return hashPassword(password);
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return comparePasswords(password, hashedPassword);
  }
}

class User {
  constructor({ id, name, email, passwordHash, role = "customer" }) {
    if (!name || name.trim().length < 2) throw new Error("Nombre inválido");
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Email inválido");
    if (!passwordHash) throw new Error("Password hash requerido");
    if (!["customer", "admin"].includes(role)) throw new Error("Rol inválido");
    this.id = id ?? null;
    this.name = name.trim();
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.role = role;
  }

  isAdmin() {
    return this.role === "admin";
  }

  toPublicJSON() {
    return { id: this.id, name: this.name, email: this.email, role: this.role };
  }
}

module.exports = { User };

class User {
  constructor({ id, name, email, role = "customer" }) {
    if (!name) throw new Error("Nombre requerido");
    if (!email) throw new Error("Email requerido");
    if (!["customer", "admin"].includes(role)) throw new Error("Rol inválido");
    this.id = id ?? null;
    this.name = name;
    this.email = email;
    this.role = role;
  }
  promote() { this.role = "admin"; }
  toJSON() { return { id: this.id, name: this.name, email: this.email, role: this.role }; }
}
module.exports = { User };

export type UserRole = "customer" | "admin";

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password: string,
    public role: UserRole = "customer"
  ) {
    this.validate();
  }

  private validate() {
    if (!this.name) {
      throw new Error("Name is required");
    }

    if (!this.email.includes("@")) {
      throw new Error("Invalid email");
    }

    const allowedDomains = ["correounivalle.edu.co", "univalle.edu.co"];
    const emailDomain = this.email.split("@")[1];
    if (!allowedDomains.includes(emailDomain)) {
      throw new Error(
        "Solo se permiten correos de la Universidad del Valle (@correounivalle.edu.co)"
      );
    }

    if (this.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
  }

  isAdmin(): boolean {
    return this.role === "admin";
  }
}

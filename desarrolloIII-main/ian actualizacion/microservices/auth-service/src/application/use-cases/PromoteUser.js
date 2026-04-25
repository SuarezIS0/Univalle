class PromoteUser {
  constructor({ userRepository, adminSecret }) {
    this.userRepository = userRepository;
    this.adminSecret = adminSecret;
  }

  async execute({ email, secret }) {
    if (!this.adminSecret) throw new Error("ADMIN_PROMOTE_SECRET no configurado");
    if (secret !== this.adminSecret) throw new Error("Secreto inválido");
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");
    return this.userRepository.updateRole(email, "admin");
  }
}

module.exports = { PromoteUser };

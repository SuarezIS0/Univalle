class PromoteToAdmin {
  constructor({ userRepository, promoteSecret }) {
    this.userRepository = userRepository;
    this.promoteSecret = promoteSecret;
  }
  async execute({ secret, email }) {
    if (secret !== this.promoteSecret) throw new Error("Secret inválido");
    const updated = await this.userRepository.update(
      await this._idFromEmail(email),
      { role: "admin" }
    );
    if (!updated) throw new Error("Usuario no encontrado");
    return updated.toJSON();
  }
  async _idFromEmail(email) {
    const u = await this.userRepository.findByEmail(email);
    if (!u) throw new Error("Usuario no encontrado");
    return u.id;
  }
}
module.exports = { PromoteToAdmin };

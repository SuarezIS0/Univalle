class DeleteUser {
  constructor({ userRepository }) { this.userRepository = userRepository; }
  async execute({ id }) {
    const ok = await this.userRepository.delete(id);
    if (!ok) throw new Error("Usuario no encontrado");
    return true;
  }
}
module.exports = { DeleteUser };

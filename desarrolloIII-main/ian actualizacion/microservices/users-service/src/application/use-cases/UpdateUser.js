class UpdateUser {
  constructor({ userRepository }) { this.userRepository = userRepository; }
  async execute({ id, name, email }) {
    const changes = {};
    if (name) changes.name = name;
    if (email) changes.email = email;
    const updated = await this.userRepository.update(id, changes);
    if (!updated) throw new Error("Usuario no encontrado");
    return updated.toJSON();
  }
}
module.exports = { UpdateUser };

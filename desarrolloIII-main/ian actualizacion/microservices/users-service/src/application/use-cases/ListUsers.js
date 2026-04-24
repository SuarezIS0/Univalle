class ListUsers {
  constructor({ userRepository }) { this.userRepository = userRepository; }
  async execute() {
    const users = await this.userRepository.findAll();
    return users.map((u) => u.toJSON());
  }
}
module.exports = { ListUsers };

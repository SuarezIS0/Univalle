const { User } = require("../../domain/entities/User");

class RegisterUser {
  constructor({ userRepository, hasher }) {
    this.userRepository = userRepository;
    this.hasher = hasher;
  }

  async execute({ name, email, password }) {
    if (!password || password.length < 6)
      throw new Error("Password mínimo 6 caracteres");
    const existing = await this.userRepository.findByEmail(email);
    if (existing) throw new Error("Email ya registrado");

    const passwordHash = await this.hasher.hash(password);
    const user = new User({ name, email, passwordHash, role: "customer" });
    return this.userRepository.save(user);
  }
}

module.exports = { RegisterUser };

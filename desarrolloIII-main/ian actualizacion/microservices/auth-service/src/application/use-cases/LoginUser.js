class LoginUser {
  constructor({ userRepository, hasher, tokenService }) {
    this.userRepository = userRepository;
    this.hasher = hasher;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Credenciales inválidas");
    const ok = await this.hasher.compare(password, user.passwordHash);
    if (!ok) throw new Error("Credenciales inválidas");

    const token = this.tokenService.generate({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { token, user: user.toPublicJSON() };
  }
}

module.exports = { LoginUser };

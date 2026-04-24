class VerifyToken {
  constructor({ tokenService }) {
    this.tokenService = tokenService;
  }

  execute({ token }) {
    const payload = this.tokenService.verify(token);
    if (!payload) throw new Error("Token inválido");
    return payload;
  }
}

module.exports = { VerifyToken };

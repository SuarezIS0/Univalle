const jwt = require("jsonwebtoken");
const { TokenService } = require("../../domain/services/TokenService");

class JwtTokenService extends TokenService {
  constructor({ secret, expiresIn = "7d" }) {
    super();
    this.secret = secret;
    this.expiresIn = expiresIn;
  }
  generate(payload) { return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn }); }
  verify(token) {
    try { return jwt.verify(token, this.secret); } catch { return null; }
  }
}

module.exports = { JwtTokenService };

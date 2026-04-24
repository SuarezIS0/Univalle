const jwt = require("jsonwebtoken");
const { TokenService } = require("../../domain/services/TokenService");

class JwtTokenService extends TokenService {
  constructor({ secret }) { super(); this.secret = secret; }
  verify(token) {
    try { return jwt.verify(token, this.secret); } catch { return null; }
  }
}
module.exports = { JwtTokenService };

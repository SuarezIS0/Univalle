const bcrypt = require("bcryptjs");
const { Hasher } = require("../../domain/services/Hasher");

class BcryptHasher extends Hasher {
  constructor(rounds = 10) {
    super();
    this.rounds = rounds;
  }
  async hash(plain) { return bcrypt.hash(plain, this.rounds); }
  async compare(plain, hash) { return bcrypt.compare(plain, hash); }
}

module.exports = { BcryptHasher };

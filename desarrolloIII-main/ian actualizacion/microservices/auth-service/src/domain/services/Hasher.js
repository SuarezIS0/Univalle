class Hasher {
  async hash(_plain) { throw new Error("not implemented"); }
  async compare(_plain, _hash) { throw new Error("not implemented"); }
}
module.exports = { Hasher };

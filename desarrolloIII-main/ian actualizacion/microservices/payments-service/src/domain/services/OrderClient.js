class OrderClient {
  async getOrder(_id, _authHeader) { throw new Error("not implemented"); }
  async confirmOrder(_id) { throw new Error("not implemented"); }
}
module.exports = { OrderClient };

/**
 * Puerto (interface). Las implementaciones viven en infrastructure/.
 * SOLID-D: las capas superiores dependen de esta abstracción, no de Mongo.
 */
class UserRepository {
  async findByEmail(_email) { throw new Error("not implemented"); }
  async save(_user) { throw new Error("not implemented"); }
  async updateRole(_email, _role) { throw new Error("not implemented"); }
}

module.exports = { UserRepository };

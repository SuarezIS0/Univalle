const { UserRepository } = require("../../domain/repositories/UserRepository");
const { User } = require("../../domain/entities/User");
const UserModel = require("./UserModel");

function toDomain(doc) {
  if (!doc) return null;
  return new User({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    passwordHash: doc.password,
    role: doc.role,
  });
}

class MongoUserRepository extends UserRepository {
  async findByEmail(email) {
    return toDomain(await UserModel.findOne({ email: email.toLowerCase() }));
  }

  async save(user) {
    const created = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.passwordHash,
      role: user.role,
    });
    return toDomain(created);
  }
}

module.exports = { MongoUserRepository };

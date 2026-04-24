const { UserRepository } = require("../../domain/repositories/UserRepository");
const { User } = require("../../domain/entities/User");
const UserModel = require("./UserModel");

function toDomain(doc) {
  if (!doc) return null;
  return new User({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
  });
}

class MongoUserRepository extends UserRepository {
  async findAll() {
    return (await UserModel.find()).map(toDomain);
  }
  async findById(id) {
    try { return toDomain(await UserModel.findById(id)); }
    catch { return null; }
  }
  async findByEmail(email) {
    return toDomain(await UserModel.findOne({ email }));
  }
  async update(id, changes) {
    return toDomain(await UserModel.findByIdAndUpdate(id, changes, { new: true }));
  }
  async delete(id) {
    const res = await UserModel.findByIdAndDelete(id);
    return !!res;
  }
  async count() { return UserModel.countDocuments(); }
}

module.exports = { MongoUserRepository };

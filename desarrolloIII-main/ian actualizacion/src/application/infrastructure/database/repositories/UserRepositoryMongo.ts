import { UserRepository } from "@/domain/repositories/UserRepository";
import { User, UserRole } from "@/domain/entities/User";
import { UserModel } from "../models/UserModel";

export class MongoUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const newUser = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    });

    return new User(
      newUser._id.toString(),
      newUser.name,
      newUser.email,
      newUser.password,
      newUser.role as UserRole
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return new User(
      user._id.toString(),
      user.name,
      user.email,
      user.password,
      user.role as UserRole
    );
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find({});
    return users.map(
      (user: any) =>
        new User(
          user._id.toString(),
          user.name,
          user.email,
          user.password,
          user.role as UserRole
        )
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;
    return new User(
      user._id.toString(),
      user.name,
      user.email,
      user.password,
      user.role as UserRole
    );
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      id,
      {
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.password && { password: updates.password }),
        ...(updates.role && { role: updates.role }),
      },
      { new: true }
    );
    if (!user) return null;
    return new User(
      user._id.toString(),
      user.name,
      user.email,
      user.password,
      user.role as UserRole
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result !== null;
  }
}

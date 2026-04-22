import { User } from "../entities/User";

export interface UserRepository {
  save(user: User): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

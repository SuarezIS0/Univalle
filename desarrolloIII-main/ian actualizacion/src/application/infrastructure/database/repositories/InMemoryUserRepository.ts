// Repositorio en memoria para testing sin MongoDB
import { UserRepository } from "@/domain/repositories/UserRepository";
import { User } from "@/domain/entities/User";

class InMemoryUserRepository implements UserRepository {
  private static instance: InMemoryUserRepository;
  private users: User[] = [];

  private constructor() {}

  static getInstance(): InMemoryUserRepository {
    if (!InMemoryUserRepository.instance) {
      InMemoryUserRepository.instance = new InMemoryUserRepository();
    }
    return InMemoryUserRepository.instance;
  }

  async save(user: User): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.email === user.email);
    
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    
    console.log(`✓ Usuario guardado en memoria: ${user.email}`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(u => u.email === email) || null;
    console.log(`📍 Buscando usuario ${email}:`, user ? "encontrado" : "no encontrado");
    return user;
  }

  async findAll(): Promise<User[]> {
    console.log(`📍 Obteniendo todos los usuarios (${this.users.length} total)`);
    return this.users;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(u => u.id === id) || null;
    console.log(`📍 Buscando usuario ${id}:`, user ? "encontrado" : "no encontrado");
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      console.log(`✗ Usuario ${id} no encontrado`);
      return null;
    }

    const updatedUser = new User(
      this.users[index].id,
      updates.name || this.users[index].name,
      updates.email || this.users[index].email,
      updates.password || this.users[index].password
    );

    this.users[index] = updatedUser;
    console.log(`✓ Usuario ${id} actualizado`);
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      console.log(`✗ Usuario ${id} no encontrado`);
      return false;
    }

    this.users.splice(index, 1);
    console.log(`✓ Usuario ${id} eliminado`);
    return true;
  }
}

export { InMemoryUserRepository };

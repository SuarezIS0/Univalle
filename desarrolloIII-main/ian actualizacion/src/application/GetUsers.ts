import { MongoUserRepository } from "@/application/infrastructure/database/repositories/UserRepositoryMongo";

export class GetUsers {
  private userRepository = new MongoUserRepository();

  async execute() {
    return await this.userRepository.findAll();
  }
}

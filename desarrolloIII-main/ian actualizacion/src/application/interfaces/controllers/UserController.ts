import { RegisterUser, RegisterUserDTO } from "@/application/use-cases/RegisterUser";
import { LoginUser, LoginUserDTO } from "@/application/LoginUser";
import { MongoUserRepository } from "@/application/infrastructure/database/repositories/UserRepositoryMongo";
import { HashService } from "@/application/infrastructure/services/HashService";
import { GetUsers } from "@/application/GetUsers";



class UserControllerFactory {
  static createRegisterUserUseCase(): RegisterUser {
    const repository = new MongoUserRepository();
    return new RegisterUser(repository, HashService);
  }

  static createLoginUserUseCase(): LoginUser {
    const repository = new MongoUserRepository();
    return new LoginUser(repository);
  }
}

export class UserController {
  static async create(data: RegisterUserDTO) {
    const registerUserUseCase = UserControllerFactory.createRegisterUserUseCase();
    return await registerUserUseCase.execute(data);
  }

  
  static async getAll() {
    const getUsers = new GetUsers();
    return await getUsers.execute();
  }


  static async login(data: LoginUserDTO) {
    const loginUserUseCase = UserControllerFactory.createLoginUserUseCase();
    return await loginUserUseCase.execute(data);
  }
}

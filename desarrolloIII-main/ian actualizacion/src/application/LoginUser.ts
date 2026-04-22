import { UserRepository } from "@/domain/repositories/UserRepository";
import { HashService } from "@/application/infrastructure/services/HashService";
import { JwtService } from "@/application/infrastructure/services/JwtService";

export type LoginUserDTO = {
  email: string;
  password: string;
};

export class LoginUser {
  constructor(private userRepository: UserRepository) {}

  async execute(data: LoginUserDTO) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Usuario no existe");
    }

    const isValid = await HashService.compare(
      data.password,
      user.password
    );

    if (!isValid) {
      throw new Error("Password incorrecto");
    }

    // Generar JWT token
    const token = JwtService.generate({
      email: user.email,
      id: user.id,
      role: user.role,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    };
  }
}




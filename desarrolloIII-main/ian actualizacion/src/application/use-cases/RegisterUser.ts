import { User } from "@/domain/entities/User"
import { UserRepository } from "@/domain/repositories/UserRepository"
import { HashService } from "@/application/infrastructure/services/HashService"

export type RegisterUserDTO = {
  name: string
  email: string
  password: string
}

export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private hashService: typeof HashService
  ) {}

  async execute(data: RegisterUserDTO) {
    const { name, email, password } = data

    // Validar que el usuario no exista
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new Error('Email already registered')
    }

    const hashedPassword = await this.hashService.hash(password)

    const user = new User(
      crypto.randomUUID(),
      name,
      email,
      hashedPassword
    )

    const savedUser = await this.userRepository.save(user)

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    }
  }
}

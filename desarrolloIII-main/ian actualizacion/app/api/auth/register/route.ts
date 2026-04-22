import { NextResponse } from "next/server"
import { RegisterUser } from "@/application/use-cases/RegisterUser"
import { HashService } from "@/application/infrastructure/services/HashService"
import { connectDB, isDBConnected } from "@/application/infrastructure/database/mongo"
import { InMemoryUserRepository } from "@/application/infrastructure/database/repositories/InMemoryUserRepository"
import { MongoUserRepository } from "@/application/infrastructure/database/repositories/UserRepositoryMongo"

async function getRepository() {
  try {
    if (!isDBConnected()) {
      await connectDB()
    }
    return new MongoUserRepository()
  } catch (error) {
    console.log("⚠ MongoDB no disponible, usando repositorio en memoria")
    return InMemoryUserRepository.getInstance()
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password } = body

    // Obtener repositorio (MongoDB o en memoria)
    const repository = await getRepository()
    const registerUser = new RegisterUser(repository, HashService)

    const user = await registerUser.execute({
      name,
      email,
      password,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}


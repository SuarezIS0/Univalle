import { NextResponse } from "next/server";
import { connectDB, isDBConnected } from "@/application/infrastructure/database/mongo";
import { InMemoryUserRepository } from "@/application/infrastructure/database/repositories/InMemoryUserRepository";
import { MongoUserRepository } from "@/application/infrastructure/database/repositories/UserRepositoryMongo";

async function getRepository() {
  try {
    if (!isDBConnected()) {
      await connectDB();
    }
    return new MongoUserRepository();
  } catch (error) {
    console.log("⚠ MongoDB no disponible, usando repositorio en memoria");
    return InMemoryUserRepository.getInstance();
  }
}

export async function GET(req: Request) {
  try {
    const repository = await getRepository();
    const users = await repository.findAll();

    return NextResponse.json(
      {
        success: true,
        data: users,
        count: users.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

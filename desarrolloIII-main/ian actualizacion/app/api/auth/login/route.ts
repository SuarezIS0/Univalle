import { NextResponse } from "next/server";
import { UserController } from "@/application/interfaces/controllers/UserController";
import { LoginUserDTO } from "@/application/LoginUser";
import { connectDB, isDBConnected } from "@/application/infrastructure/database/mongo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Intentar conectar solo si no está conectado
    if (!isDBConnected()) {
      try {
        await connectDB();
      } catch (error) {
        return NextResponse.json(
          { error: "Base de datos no disponible" },
          { status: 503 }
        );
      }
    }
    
    const loginData: LoginUserDTO = {
      email: body.email,
      password: body.password,
    };

    const user = await UserController.login(loginData);
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}

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
    return InMemoryUserRepository.getInstance();
  }
}

// GET /api/users/:id
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const repository = await getRepository();
    const user = await repository.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
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

// PUT /api/users/:id
export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const repository = await getRepository();

    const user = await repository.update(id, {
      name: body.name,
      email: body.email,
      password: body.password,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: "Usuario actualizado correctamente",
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}

// DELETE /api/users/:id
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const repository = await getRepository();
    const deleted = await repository.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario eliminado correctamente",
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

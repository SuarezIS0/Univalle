import { NextResponse } from "next/server";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import { UserModel } from "@/application/infrastructure/database/models/UserModel";

const PROMOTE_SECRET =
  process.env.ADMIN_PROMOTE_SECRET || "univalle-admin-seed";

export async function POST(req: Request) {
  try {
    if (!isDBConnected()) await connectDB();
    const body = await req.json();
    if (body.secret !== PROMOTE_SECRET) {
      return NextResponse.json(
        { success: false, error: "Secret inválido" },
        { status: 401 }
      );
    }
    const user = await UserModel.findOneAndUpdate(
      { email: body.email },
      { role: "admin" },
      { new: true }
    );
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: `${user.email} ahora es admin`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

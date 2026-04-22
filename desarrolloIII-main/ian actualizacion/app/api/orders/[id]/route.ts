import { NextResponse } from "next/server";
import { OrderController } from "@/application/interfaces/controllers/OrderController";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import {
  authenticate,
  requireAdmin,
} from "@/application/infrastructure/services/AuthGuard";

async function ensureDB() {
  if (!isDBConnected()) await connectDB();
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticate(req);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    await ensureDB();
    const { id } = await ctx.params;
    const order = await OrderController.getById(id);
    if (
      order.userId !== auth.payload.id &&
      auth.payload.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const guard = requireAdmin(req);
    if (!guard.ok) {
      return NextResponse.json(
        { success: false, error: guard.message },
        { status: guard.status }
      );
    }
    await ensureDB();
    const { id } = await ctx.params;
    const body = await req.json();
    const updated = await OrderController.updateStatus(id, body.status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

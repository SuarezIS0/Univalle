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

export async function GET(req: Request) {
  try {
    const auth = authenticate(req);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    await ensureDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    if (scope === "all") {
      const admin = requireAdmin(req);
      if (!admin.ok) {
        return NextResponse.json(
          { success: false, error: admin.message },
          { status: admin.status }
        );
      }
      const orders = await OrderController.getAll();
      return NextResponse.json({ success: true, data: orders });
    }

    const orders = await OrderController.getAll(auth.payload.id);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticate(req);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    await ensureDB();
    const body = await req.json();
    const order = await OrderController.create({
      userId: auth.payload.id!,
      items: body.items,
      shipping: body.shipping,
    });
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { OrderController } from "@/application/interfaces/controllers/OrderController";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import { authenticate } from "@/application/infrastructure/services/AuthGuard";

async function ensureDB() {
  if (!isDBConnected()) await connectDB();
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
    const result = await OrderController.pay({
      orderId: body.orderId,
      cardNumber: body.cardNumber,
      cardHolder: body.cardHolder,
    });
    return NextResponse.json(
      { success: result.success, data: result },
      { status: result.success ? 200 : 402 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

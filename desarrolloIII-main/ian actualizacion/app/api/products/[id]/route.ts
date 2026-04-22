import { NextResponse } from "next/server";
import { ProductController } from "@/application/interfaces/controllers/ProductController";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import { requireAdmin } from "@/application/infrastructure/services/AuthGuard";

async function ensureDB() {
  if (!isDBConnected()) await connectDB();
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDB();
    const { id } = await ctx.params;
    const product = await ProductController.getById(id);
    return NextResponse.json({ success: true, data: product });
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
    const updated = await ProductController.update(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(
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
    await ProductController.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

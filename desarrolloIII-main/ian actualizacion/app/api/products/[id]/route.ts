import { NextResponse } from "next/server";
import { ProductController } from "@/application/interfaces/controllers/ProductController";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import { requireAdmin } from "@/application/infrastructure/services/AuthGuard";
import { ProductCategory } from "@/domain/entities/Product";
import { parseProductPayload } from "../_payload";

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
    if (product.isArchived()) {
      return NextResponse.json(
        { success: false, error: "Producto archivado" },
        { status: 410 }
      );
    }
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
    const payload = await parseProductPayload(req);
    const updated = await ProductController.update(id, {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.price !== undefined && { price: Number(payload.price) }),
      ...(payload.stock !== undefined && { stock: Number(payload.stock) }),
      ...(payload.category !== undefined && {
        category: payload.category as ProductCategory,
      }),
      ...(payload.imageFile && { imageFile: payload.imageFile }),
    });
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
    const archived = await ProductController.archive(id);
    return NextResponse.json({ success: true, data: archived });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    const status = msg.includes("orden(es) activa(s)") ? 409 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

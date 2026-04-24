import { NextResponse } from "next/server";
import { ProductController } from "@/application/interfaces/controllers/ProductController";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import { requireAdmin } from "@/application/infrastructure/services/AuthGuard";
import { ProductCategory } from "@/domain/entities/Product";
import { parseProductPayload } from "./_payload";

async function ensureDB() {
  if (!isDBConnected()) {
    await connectDB();
  }
}

export async function GET(req: Request) {
  try {
    await ensureDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as ProductCategory | null;
    const search = searchParams.get("search");
    const includeArchived = searchParams.get("includeArchived") === "true";

    const products = await ProductController.getAll({
      ...(category && { category }),
      ...(search && { search }),
      ...(includeArchived && { includeArchived: true }),
    });
    return NextResponse.json(
      { success: true, data: products, count: products.length },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const guard = requireAdmin(req);
    if (!guard.ok) {
      return NextResponse.json(
        { success: false, error: guard.message },
        { status: guard.status }
      );
    }
    await ensureDB();
    const payload = await parseProductPayload(req);
    const product = await ProductController.create({
      name: payload.name ?? "",
      description: payload.description ?? "",
      price: Number(payload.price ?? 0),
      stock: Number(payload.stock ?? 0),
      category: payload.category as ProductCategory | undefined,
      ...(payload.imageFile && { imageFile: payload.imageFile }),
    });
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import {
  connectDB,
  isDBConnected,
} from "@/application/infrastructure/database/mongo";
import { requireAdmin } from "@/application/infrastructure/services/AuthGuard";
import { UserModel } from "@/application/infrastructure/database/models/UserModel";
import { ProductModel } from "@/application/infrastructure/database/models/ProductModel";
import { OrderModel } from "@/application/infrastructure/database/models/OrderModel";

async function ensureDB() {
  if (!isDBConnected()) await connectDB();
}

export async function GET(req: Request) {
  try {
    const guard = requireAdmin(req);
    if (!guard.ok) {
      return NextResponse.json(
        { success: false, error: guard.message },
        { status: guard.status }
      );
    }
    await ensureDB();

    const [users, products, pending, confirmed, shipped, delivered, cancelled, orders] =
      await Promise.all([
        UserModel.countDocuments(),
        ProductModel.countDocuments(),
        OrderModel.countDocuments({ status: "pending" }),
        OrderModel.countDocuments({ status: "confirmed" }),
        OrderModel.countDocuments({ status: "shipped" }),
        OrderModel.countDocuments({ status: "delivered" }),
        OrderModel.countDocuments({ status: "cancelled" }),
        OrderModel.find({
          status: { $in: ["confirmed", "shipped", "delivered"] },
        }),
      ]);

    const totalSales = orders.reduce(
      (sum: number, o: any) => sum + (o.total ?? 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        users,
        products,
        totalSales,
        orders: {
          pending,
          confirmed,
          shipped,
          delivered,
          cancelled,
          total: pending + confirmed + shipped + delivered + cancelled,
        },
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// Define the context type for Next.js 15
type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Await params to get the id
  const { id } = await params;

  const orders = await query(
    `SELECT o.*, json_agg(json_build_object(
      'id', oi.id, 'product_name', oi.product_name, 'quantity', oi.quantity,
      'unit_price', oi.unit_price, 'subtotal', oi.subtotal,
      'weight_option', oi.weight_option, 'product_image', oi.product_image,
      'product_id', oi.product_id
    )) as items
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1
     GROUP BY o.id`,
    [id],
  );

  if (!orders[0])
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(orders[0]);
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Await params to get the id
  const { id } = await params;

  const body = await req.json();
  const { status } = body;

  const validStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id],
  );

  if (!updated[0])
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated[0]);
}

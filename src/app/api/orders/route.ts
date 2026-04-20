import { NextRequest, NextResponse } from "next/server";
import { transaction } from "@/lib/db";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";
import { generateOrderNumber } from "@/lib/utils";
import { CartItem } from "@/types";
import { z } from "zod";

const OrderSchema = z.object({
  customer_name: z.string().min(2, "Naam is verplicht"),
  customer_email: z.string().email("Ongeldig e-mailadres"),
  customer_phone: z.string().optional().default(""),
  delivery_address: z.string().min(3, "Adres is verplicht"),
  delivery_city: z.string().min(2, "Plaatsnaam is verplicht"),
  delivery_postal_code: z
    .string()
    .regex(/^\d{4}\s?[A-Z]{2}$/i, "Ongeldige postcode"),
  notes: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        product_id: z.string(),
        product_name: z.string(),
        product_image: z.string().nullable().optional(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
        weight_option: z.string().optional(),
      }),
    )
    .min(1, "Geen producten in bestelling"),
  delivery_cost: z.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json({ error: firstError.message }, { status: 400 });
    }

    const data = parsed.data;

    // FIX: Match the exact expectations of the CartItem type
    const items: CartItem[] = data.items.map((item) => ({
      ...item,
      // product_image wants null (based on previous error)
      product_image: item.product_image ?? null,
      // weight_option wants undefined (based on current error)
      weight_option: item.weight_option ?? undefined,
    }));

    // Calculate totals server-side (never trust client totals)
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const deliveryCost = subtotal >= 25 ? 0 : data.delivery_cost;
    const total = subtotal + deliveryCost;
    const orderNumber = generateOrderNumber();

    const order = await transaction(async (client) => {
      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          delivery_address, delivery_city, delivery_postal_code,
          notes, status, subtotal, delivery_cost, total_amount
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending',$9,$10,$11)
        RETURNING *`,
        [
          orderNumber,
          data.customer_name.trim(),
          data.customer_email.trim().toLowerCase(),
          data.customer_phone.trim(),
          data.delivery_address.trim(),
          data.delivery_city.trim(),
          data.delivery_postal_code.trim().toUpperCase(),
          data.notes?.trim() || null,
          subtotal,
          deliveryCost,
          total,
        ],
      );
      const newOrder = orderResult.rows[0];

      // Insert order items
      const insertedItems = [];
      for (const item of items) {
        const itemResult = await client.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, product_image,
            weight_option, unit_price, quantity, subtotal
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [
            newOrder.id,
            item.product_id,
            item.product_name,
            item.product_image, // Already handled as null/string above
            item.weight_option, // Already handled as null/string above
            item.price,
            item.quantity,
            item.price * item.quantity,
          ],
        );
        insertedItems.push(itemResult.rows[0]);
      }

      return { order: newOrder, items: insertedItems };
    });

    // Send emails
    try {
      await Promise.all([
        sendOrderConfirmation(order.order, order.items),
        sendAdminNotification(order.order, order.items),
      ]);
    } catch (emailErr) {
      console.error("Email send failed (order still created):", emailErr);
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
      order_id: order.order.id,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      {
        error: "Er is een fout opgetreden bij het plaatsen van uw bestelling.",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const conditions = ["1=1"];
  const params: (string | number)[] = [];
  let idx = 1;

  if (status) {
    conditions.push(`o.status = $${idx++}`);
    params.push(status);
  }
  if (search) {
    conditions.push(
      `(o.customer_name ILIKE $${idx} OR o.customer_email ILIKE $${idx} OR o.order_number ILIKE $${idx})`,
    );
    params.push(`%${search}%`);
    idx++;
  }

  const { query } = await import("@/lib/db");

  const [orders, countResult] = await Promise.all([
    query(
      `SELECT o.*, 
        json_agg(json_build_object(
          'id', oi.id, 'product_name', oi.product_name,
          'quantity', oi.quantity, 'unit_price', oi.unit_price,
          'subtotal', oi.subtotal, 'weight_option', oi.weight_option,
          'product_image', oi.product_image
        )) as items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE ${conditions.join(" AND ")}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, pageSize, offset],
    ),
    query(
      `SELECT COUNT(*) as count FROM orders o WHERE ${conditions.join(" AND ")}`,
      params,
    ),
  ]);

  return NextResponse.json({
    data: orders,
    total: parseInt((countResult[0] as { count: string }).count),
    page,
    pageSize,
    totalPages: Math.ceil(
      parseInt((countResult[0] as { count: string }).count) / pageSize,
    ),
  });
}

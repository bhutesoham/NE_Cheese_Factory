import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { Order, OrderItem } from "@/types";
import { formatPrice, formatDateTime } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, Phone, MapPin, Package } from "lucide-react";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

export const dynamic = "force-dynamic";

async function getOrder(
  id: string,
): Promise<(Order & { items: OrderItem[] }) | null> {
  const rows = await query(
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

  if (!rows[0]) return null;

  // Cast as 'any' to allow the spread operator and field access without strict overlap errors
  const o = rows[0] as any;

  return {
    ...o,
    total_amount: parseFloat(o.total_amount),
    subtotal: parseFloat(o.subtotal),
    delivery_cost: parseFloat(o.delivery_cost),
    items: (o.items || [])
      .filter((i: any) => i.id)
      .map((i: any) => ({
        ...i,
        unit_price: parseFloat(i.unit_price),
        subtotal: parseFloat(i.subtotal),
      })),
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  // Next.js 15: params must be awaited
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) notFound();

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-earth-500 hover:text-cheese-600 mb-6 transition-colors"
      >
        <ChevronLeft size={16} /> Terug naar bestellingen
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl text-earth-900">
            Bestelling #{order.order_number}
          </h1>
          <p className="text-earth-500 mt-1">
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-earth-100">
              <h2 className="font-serif text-xl text-earth-900">Producten</h2>
            </div>
            <div className="divide-y divide-earth-50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-100 shrink-0">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🧀
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-earth-900">
                      {item.product_name}
                    </p>
                    {item.weight_option && (
                      <p className="text-sm text-earth-400">
                        {item.weight_option}
                      </p>
                    )}
                    <p className="text-sm text-earth-500">
                      {item.quantity}× {formatPrice(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-earth-900">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-earth-100 bg-earth-50 space-y-1 text-sm">
              <div className="flex justify-between text-earth-600">
                <span>Subtotaal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-earth-600">
                <span>Bezorgkosten</span>
                <span>
                  {order.delivery_cost > 0
                    ? formatPrice(order.delivery_cost)
                    : "Gratis"}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base text-earth-900 pt-1 border-t border-earth-200 mt-1">
                <span>Totaal</span>
                <span className="font-serif text-lg text-cheese-700">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-serif text-lg text-earth-900 mb-4">
              Klantgegevens
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-cheese-50 flex items-center justify-center text-cheese-600 shrink-0 mt-0.5">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-earth-900">
                    {order.customer_name}
                  </p>
                </div>
              </div>
              <a
                href={`mailto:${order.customer_email}`}
                className="flex items-center gap-2 text-earth-600 hover:text-cheese-600 transition-colors"
              >
                <Mail size={14} className="shrink-0" />
                {order.customer_email}
              </a>
              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center gap-2 text-earth-600 hover:text-cheese-600 transition-colors"
                >
                  <Phone size={14} className="shrink-0" />
                  {order.customer_phone}
                </a>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-serif text-lg text-earth-900 mb-3">
              Bezorgadres
            </h2>
            <div className="flex items-start gap-2 text-sm text-earth-600">
              <MapPin size={14} className="shrink-0 mt-0.5" />
              <div>
                <p>{order.delivery_address}</p>
                <p>
                  {order.delivery_postal_code} {order.delivery_city}
                </p>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="card p-5">
              <h2 className="font-serif text-lg text-earth-900 mb-2">
                Opmerking klant
              </h2>
              <p className="text-sm text-earth-600 italic">"{order.notes}"</p>
            </div>
          )}

          <div className="bg-cheese-50 border border-cheese-200 rounded-xl p-4 text-sm text-cheese-800">
            <div className="flex items-center gap-2 font-medium mb-1">
              <Package size={14} />
              Betaling bij levering
            </div>
            <p className="text-cheese-700">
              Herinner de klant te betalen bij ontvangst van de bestelling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

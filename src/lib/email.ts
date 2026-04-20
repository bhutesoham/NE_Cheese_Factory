import { Resend } from "resend";
import { Order, OrderItem } from "@/types";

// 1. Initialize with a fallback string to prevent the constructor from crashing the build
const apiKey = process.env.RESEND_API_KEY || "re_dummy_key_for_build";
export const resend = new Resend(apiKey);

const FROM = process.env.FROM_EMAIL || "bestellingen@yourshop.nl";
const ADMIN_NOTIFY = process.env.ADMIN_EMAIL_NOTIFY || "";
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || "De Kaaswinkel";

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function orderItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #f0ead6;">
      <td style="padding:10px 8px;color:#3d2a00;">${item.product_name}${item.weight_option ? ` <span style="color:#7a6344;">(${item.weight_option})</span>` : ""}</td>
      <td style="padding:10px 8px;text-align:center;color:#5c3d00;">${item.quantity}×</td>
      <td style="padding:10px 8px;text-align:right;color:#3d2a00;">${formatPrice(item.unit_price)}</td>
      <td style="padding:10px 8px;text-align:right;font-weight:600;color:#3d2a00;">${formatPrice(item.subtotal)}</td>
    </tr>
  `,
    )
    .join("");
}

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${SHOP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#faf8f2;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;color:#3d2a00;margin:0;letter-spacing:-0.5px;">${SHOP_NAME}</h1>
      <p style="color:#7a6344;font-size:14px;margin:4px 0 0;">Ambachtelijke kazen, rechtstreeks van de boer</p>
    </div>
    <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #f0e8d0;">
      ${content}
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#9e8060;font-size:12px;line-height:1.6;">
        ${SHOP_NAME} · ${process.env.NEXT_PUBLIC_SHOP_EMAIL || ""}<br>
        ${process.env.NEXT_PUBLIC_SHOP_PHONE || ""}<br><br>
        Uw persoonsgegevens worden uitsluitend gebruikt voor de verwerking van uw bestelling.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendOrderConfirmation(
  order: Order,
  items: OrderItem[],
): Promise<void> {
  // 2. Safeguard: Don't attempt to send if the real API key is missing (like during build)
  if (!process.env.RESEND_API_KEY) {
    console.warn("Skipping Order Confirmation Email: No API Key found.");
    return;
  }

  const content = `
    <h2 style="color:#3d2a00;margin:0 0 4px;font-size:22px;">Bedankt voor uw bestelling!</h2>
    <p style="color:#7a6344;margin:0 0 24px;font-size:14px;">Bestelling #${order.order_number}</p>
    <p style="color:#5c3d00;line-height:1.7;margin:0 0 24px;">
      Beste ${order.customer_name},<br><br>
      Wij hebben uw bestelling in goede orde ontvangen.
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#faf5ec;">
          <th style="padding:8px;text-align:left;color:#7a6344;font-size:13px;">Product</th>
          <th style="padding:8px;text-align:center;color:#7a6344;font-size:13px;">Aantal</th>
          <th style="padding:8px;text-align:right;color:#7a6344;font-size:13px;">Stukprijs</th>
          <th style="padding:8px;text-align:right;color:#7a6344;font-size:13px;">Totaal</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(items)}
      </tbody>
    </table>
    <div style="border-top:2px solid #f0e8d0;padding-top:12px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;">
        <span>Totaal</span>
        <span style="color:#c45e08;">${formatPrice(order.total_amount)}</span>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Bestelling #${order.order_number} ontvangen – ${SHOP_NAME}`,
    html: baseTemplate(content),
  });
}

export async function sendAdminNotification(
  order: Order,
  items: OrderItem[],
): Promise<void> {
  // 3. Safeguard: Don't attempt to send if key or admin email is missing
  if (!process.env.RESEND_API_KEY || !ADMIN_NOTIFY) return;

  const content = `
    <h2 style="color:#3d2a00;margin:0 0 4px;font-size:22px;">Nieuwe bestelling ontvangen!</h2>
    <p style="color:#7a6344;margin:0 0 24px;font-size:14px;">Bestelling #${order.order_number}</p>
    <h3 style="color:#3d2a00;font-size:16px;">Klant: ${order.customer_name}</h3>
    <p>Email: ${order.customer_email}</p>
    <div style="text-align:right;font-size:20px;font-weight:700;color:#c45e08;border-top:2px solid #f0e8d0;padding-top:12px;">
      Totaal: ${formatPrice(order.total_amount)}
    </div>
  `;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_NOTIFY,
    subject: `🧀 Nieuwe bestelling #${order.order_number} – ${formatPrice(order.total_amount)}`,
    html: baseTemplate(content),
  });
}

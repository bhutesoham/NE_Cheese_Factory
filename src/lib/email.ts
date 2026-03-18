import { Resend } from 'resend'
import { Order, OrderItem } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.FROM_EMAIL || 'bestellingen@yourshop.nl'
const ADMIN_NOTIFY = process.env.ADMIN_EMAIL_NOTIFY || ''
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || 'De Kaaswinkel'

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}

function orderItemsHtml(items: OrderItem[]): string {
  return items.map(item => `
    <tr style="border-bottom:1px solid #f0ead6;">
      <td style="padding:10px 8px;color:#3d2a00;">${item.product_name}${item.weight_option ? ` <span style="color:#7a6344;">(${item.weight_option})</span>` : ''}</td>
      <td style="padding:10px 8px;text-align:center;color:#5c3d00;">${item.quantity}×</td>
      <td style="padding:10px 8px;text-align:right;color:#3d2a00;">${formatPrice(item.unit_price)}</td>
      <td style="padding:10px 8px;text-align:right;font-weight:600;color:#3d2a00;">${formatPrice(item.subtotal)}</td>
    </tr>
  `).join('')
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
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:28px;color:#3d2a00;margin:0;letter-spacing:-0.5px;">${SHOP_NAME}</h1>
      <p style="color:#7a6344;font-size:14px;margin:4px 0 0;">Ambachtelijke kazen, rechtstreeks van de boer</p>
    </div>
    <!-- Content -->
    <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #f0e8d0;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#9e8060;font-size:12px;line-height:1.6;">
        ${SHOP_NAME} · ${process.env.NEXT_PUBLIC_SHOP_EMAIL || ''}<br>
        ${process.env.NEXT_PUBLIC_SHOP_PHONE || ''}<br><br>
        Uw persoonsgegevens worden uitsluitend gebruikt voor de verwerking van uw bestelling
        en worden niet gedeeld met derden. Zie onze <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy" style="color:#c45e08;">privacyverklaring</a>.
      </p>
    </div>
  </div>
</body>
</html>
  `
}

export async function sendOrderConfirmation(order: Order, items: OrderItem[]): Promise<void> {
  const content = `
    <h2 style="color:#3d2a00;margin:0 0 4px;font-size:22px;">Bedankt voor uw bestelling!</h2>
    <p style="color:#7a6344;margin:0 0 24px;font-size:14px;">Bestelling #${order.order_number}</p>

    <p style="color:#5c3d00;line-height:1.7;margin:0 0 24px;">
      Beste ${order.customer_name},<br><br>
      Wij hebben uw bestelling in goede orde ontvangen. We nemen zo spoedig mogelijk contact met u op
      om de levering te bevestigen.
    </p>

    <h3 style="color:#3d2a00;font-size:16px;margin:0 0 12px;border-bottom:2px solid #f0e8d0;padding-bottom:8px;">Uw bestelling</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#faf5ec;">
          <th style="padding:8px;text-align:left;color:#7a6344;font-size:13px;font-weight:600;">Product</th>
          <th style="padding:8px;text-align:center;color:#7a6344;font-size:13px;font-weight:600;">Aantal</th>
          <th style="padding:8px;text-align:right;color:#7a6344;font-size:13px;font-weight:600;">Stukprijs</th>
          <th style="padding:8px;text-align:right;color:#7a6344;font-size:13px;font-weight:600;">Totaal</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHtml(items)}
      </tbody>
    </table>

    <div style="border-top:2px solid #f0e8d0;padding-top:12px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#7a6344;">Subtotaal</span>
        <span style="color:#3d2a00;">${formatPrice(order.subtotal)}</span>
      </div>
      ${order.delivery_cost > 0 ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#7a6344;">Bezorgkosten</span>
        <span style="color:#3d2a00;">${formatPrice(order.delivery_cost)}</span>
      </div>` : `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="color:#7a6344;">Bezorgkosten</span>
        <span style="color:#357835;">Gratis</span>
      </div>`}
      <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;margin-top:8px;padding-top:8px;border-top:1px solid #f0e8d0;">
        <span style="color:#3d2a00;">Totaal</span>
        <span style="color:#c45e08;">${formatPrice(order.total_amount)}</span>
      </div>
    </div>

    <h3 style="color:#3d2a00;font-size:16px;margin:0 0 12px;border-bottom:2px solid #f0e8d0;padding-bottom:8px;">Bezorgadres</h3>
    <p style="color:#5c3d00;margin:0 0 24px;line-height:1.7;">
      ${order.delivery_address}<br>
      ${order.delivery_postal_code} ${order.delivery_city}
    </p>

    ${order.notes ? `
    <div style="background:#faf5ec;border-radius:8px;padding:16px;margin-bottom:24px;">
      <strong style="color:#3d2a00;font-size:14px;">Uw notitie:</strong>
      <p style="color:#5c3d00;margin:4px 0 0;font-size:14px;">${order.notes}</p>
    </div>` : ''}

    <div style="background:#f0faf0;border-radius:8px;padding:16px;border-left:4px solid #357835;">
      <p style="color:#265926;margin:0;font-size:14px;line-height:1.6;">
        <strong>Betaling:</strong> U betaalt bij ontvangst van uw bestelling (contant of via overschrijving).
        Wij nemen contact met u op om de leverdatum te bevestigen.
      </p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Bestelling #${order.order_number} ontvangen – ${SHOP_NAME}`,
    html: baseTemplate(content),
  })
}

export async function sendAdminNotification(order: Order, items: OrderItem[]): Promise<void> {
  if (!ADMIN_NOTIFY) return

  const content = `
    <h2 style="color:#3d2a00;margin:0 0 4px;font-size:22px;">Nieuwe bestelling ontvangen!</h2>
    <p style="color:#7a6344;margin:0 0 24px;font-size:14px;">Bestelling #${order.order_number} · ${new Date(order.created_at).toLocaleString('nl-NL')}</p>

    <h3 style="color:#3d2a00;font-size:16px;margin:0 0 12px;">Klantgegevens</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:6px 0;color:#7a6344;width:140px;">Naam</td><td style="color:#3d2a00;">${order.customer_name}</td></tr>
      <tr><td style="padding:6px 0;color:#7a6344;">E-mail</td><td style="color:#3d2a00;"><a href="mailto:${order.customer_email}" style="color:#c45e08;">${order.customer_email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#7a6344;">Telefoon</td><td style="color:#3d2a00;">${order.customer_phone || '–'}</td></tr>
      <tr><td style="padding:6px 0;color:#7a6344;">Adres</td><td style="color:#3d2a00;">${order.delivery_address}, ${order.delivery_postal_code} ${order.delivery_city}</td></tr>
      ${order.notes ? `<tr><td style="padding:6px 0;color:#7a6344;">Notitie</td><td style="color:#3d2a00;">${order.notes}</td></tr>` : ''}
    </table>

    <h3 style="color:#3d2a00;font-size:16px;margin:0 0 12px;border-bottom:2px solid #f0e8d0;padding-bottom:8px;">Bestelde producten</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#faf5ec;">
          <th style="padding:8px;text-align:left;color:#7a6344;font-size:13px;">Product</th>
          <th style="padding:8px;text-align:center;color:#7a6344;font-size:13px;">Aantal</th>
          <th style="padding:8px;text-align:right;color:#7a6344;font-size:13px;">Subtotaal</th>
        </tr>
      </thead>
      <tbody>${orderItemsHtml(items)}</tbody>
    </table>

    <div style="text-align:right;font-size:20px;font-weight:700;color:#c45e08;border-top:2px solid #f0e8d0;padding-top:12px;">
      Totaal: ${formatPrice(order.total_amount)}
    </div>

    <div style="margin-top:24px;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${order.id}" 
         style="background:#c45e08;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Bekijk bestelling in admin
      </a>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: ADMIN_NOTIFY,
    subject: `🧀 Nieuwe bestelling #${order.order_number} – ${formatPrice(order.total_amount)}`,
    html: baseTemplate(content),
  })
}

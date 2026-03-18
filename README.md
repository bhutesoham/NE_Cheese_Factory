# 🧀 The Cheese Shop — E-commerce Website

A complete online shop for selling cheese from home, built with Next.js and PostgreSQL.

---

## What's included

- **Shop**: product catalog with filters and search, product detail pages, shopping cart, checkout
- **Admin panel**: dashboard with stats, product management, order management
- **Emails**: automatic order confirmation to customer + notification to you
- **GDPR**: privacy policy page, secure data handling
- **Payment**: cash on delivery (no payment gateway needed)

---

## Requirements

Before you start, make sure you have these installed:

- **Node.js** (version 18 or higher) → https://nodejs.org
- **PostgreSQL** (version 14 or higher) → https://www.postgresql.org/download
- **A Resend account** (free) → https://resend.com — needed to send order emails
- **A code editor** like VS Code → https://code.visualstudio.com

---

## Installation — step by step

### Step 1 — Install packages

Open a terminal in the project folder and run:

```bash
npm install
```

### Step 2 — Create the database

Open pgAdmin, right-click **Databases** → **Create** → **Database**, name it `kaaswinkel`. Or run in the terminal:

```bash
createdb kaaswinkel
```

### Step 3 — Set up your environment file

Copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and fill in your details:

```
# Your PostgreSQL connection
# Format: postgresql://username:password@localhost:PORT/kaaswinkel
# If your password has special characters like # use %23 instead
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kaaswinkel

# Generate a random secret (go to randomkeygen.com and copy a long key)
JWT_SECRET=paste-a-long-random-string-here

# Your admin login credentials
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=yourchosenpassword

# Resend email (get your API key from resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=orders@yourdomain.com
ADMIN_EMAIL_NOTIFY=your@email.com

# Your site URL (change this when you go live)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Your shop details (shown on the website and in emails)
NEXT_PUBLIC_SHOP_NAME=The Cheese Shop
NEXT_PUBLIC_SHOP_EMAIL=info@yourshop.com
NEXT_PUBLIC_SHOP_PHONE=+31 6 12345678
```

> **Note about Resend:** You need to verify your own domain on resend.com before sending emails.
> While testing, you can set `FROM_EMAIL=onboarding@resend.dev`.

### Step 4 — Set up the database tables

```bash
npm run db:migrate
```

This creates all the tables and adds sample cheese products.

### Step 5 — Create your admin account

```bash
npm run db:seed
```

This creates an admin account using the email and password from your `.env.local`.

If you ever need to reset your password, run:

```bash
node scripts/reset-password.js your@email.com yournewpassword
```

### Step 6 — Start the website

```bash
npm run dev
```

Open your browser at **http://localhost:3000** — the shop is running!

The admin panel is at **http://localhost:3000/admin/login**.

---

## How to use the admin panel

### Logging in

Go to `/admin/login` and enter your email and password.

### Adding products

1. Click **Products** in the left menu
2. Click **New product**
3. Fill in the name, description, price, and upload photos
4. Click Save — the product is immediately visible in the shop

### Managing orders

1. You receive an email when a customer places an order
2. Go to **Orders** in the admin panel
3. Click an order to see all customer details
4. Update the order status as you process it:
   - **Pending** → just received
   - **Confirmed** → you have confirmed with the customer
   - **Shipped** → on the way
   - **Completed** → delivered and paid
   - **Cancelled** → cancelled

### Dashboard

The dashboard shows you a quick overview of total orders, pending orders, total revenue, and your product inventory.

---

## Going live (deploying online)

### Option A — Vercel (recommended, free to start)

1. Create an account at [vercel.com](https://vercel.com)
2. Push your project to GitHub
3. Import the project in Vercel
4. Add all your environment variables (the same ones from `.env.local`)
5. Vercel deploys automatically

> **Database for production:** Use [Neon](https://neon.tech) — free hosted PostgreSQL.
> Create a database there and copy the connection string to `DATABASE_URL` in Vercel.

### Option B — VPS (DigitalOcean, Hetzner, etc.)

1. Install Node.js and PostgreSQL on the server
2. Clone the project
3. Create `.env.local` with your production values
4. Run `npm install && npm run db:migrate && npm run db:seed`
5. Build: `npm run build`
6. Start: `npm start`
7. Use a process manager like PM2 to keep it running

---

## Customising the shop

### Change the shop name, email and phone

Edit these lines in `.env.local`:

```
NEXT_PUBLIC_SHOP_NAME=Your Shop Name
NEXT_PUBLIC_SHOP_EMAIL=info@yourshop.com
NEXT_PUBLIC_SHOP_PHONE=+31 6 12345678
```

### Change delivery costs

Open `src/lib/utils.ts` and edit these two lines:

```typescript
export const DELIVERY_COST = 3.95; // delivery fee below the free threshold
export const FREE_DELIVERY_THRESHOLD = 25; // free delivery above this amount (€)
```

### Change the currency

Open `src/lib/utils.ts` and change `EUR` to your currency code in the `formatPrice` function.

---

## Troubleshooting

**Cannot connect to database**

- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `.env.local` is correct
- If your password has `#`, replace it with `%23` in the URL

**Login not working**
Run this to reset your password:

```bash
node scripts/reset-password.js your@email.com yournewpassword
```

**Emails not sending**

- Check your `RESEND_API_KEY` is correct in `.env.local`
- Make sure your domain is verified in Resend
- While testing, use `FROM_EMAIL=onboarding@resend.dev`

**Page shows blank after deploying**
Run `npm run build` first to check for any build errors before deploying.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                     # Homepage
│   ├── shop/                        # Customer-facing shop
│   │   ├── page.tsx                 # Product listing
│   │   ├── products/[slug]/         # Product detail page
│   │   ├── cart/                    # Shopping cart
│   │   ├── checkout/                # Checkout form
│   │   └── order-confirmation/      # Thank you page
│   ├── admin/                       # Admin panel
│   │   ├── dashboard/               # Overview stats
│   │   ├── products/                # Manage products
│   │   └── orders/                  # Manage orders
│   ├── api/                         # Backend API endpoints
│   └── privacy/                     # Privacy policy page
├── components/
│   ├── layout/                      # Header and Footer
│   ├── shop/                        # Product cards, filters
│   └── admin/                       # Admin UI components
├── lib/
│   ├── db.ts                        # Database connection
│   ├── auth.ts                      # Login / session handling
│   ├── email.ts                     # Email sending
│   └── utils.ts                     # Helper functions
scripts/
├── migrate.js                       # Creates database tables
├── seed.js                          # Creates admin account
└── reset-password.js                # Resets admin password
sql/
└── 001_schema.sql                   # Database schema
```

---

## Tech stack

| Part           | Technology           |
| -------------- | -------------------- |
| Framework      | Next.js 14           |
| Database       | PostgreSQL           |
| Styling        | Tailwind CSS         |
| Email          | Resend               |
| Authentication | JWT + secure cookies |
| Language       | TypeScript           |

---

Built with ❤️ for artisan cheese sellers.

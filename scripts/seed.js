#!/usr/bin/env node
// Run with: npm run db:seed
const path = require("path");
const fs = require("fs");

const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
} else {
  console.error("❌ .env.local NOT FOUND at:", envPath);
  console.error("Create it in the project root with your DATABASE_URL.\n");
  console.log("ℹ️ No .env.local found, using environment variables from ECS");
}

const DB_URL = process.env.DATABASE_URL;

// 🔍 Debug: log what ECS is actually injecting
try {
  const parsed = new URL(DB_URL);
  console.log("🔍 DATABASE_URL host:", parsed.hostname);
  console.log("🔍 DATABASE_URL user:", parsed.username);
  console.log("🔍 DATABASE_URL password:", parsed.password);
} catch {
  console.error("🔍 DATABASE_URL is invalid or undefined:", DB_URL);
}

if (!DB_URL || DB_URL.includes("username:password")) {
  console.error("\n❌ DATABASE_URL is not set correctly in .env.local");
  console.error(
    "Example: DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kaaswinkel\n",
  );
  process.exit(1);
}

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: DB_URL });

async function seed() {
  const client = await pool.connect();
  try {
    const email = process.env.ADMIN_EMAIL || "admin@kaaswinkel.nl";
    const password = process.env.ADMIN_PASSWORD || "changeme123";
    const name = "Admin";

    console.log("🌱 Creating admin user...");
    const passwordHash = await bcrypt.hash(password, 12);

    await client.query(
      `INSERT INTO admin_users (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3`,
      [email, passwordHash, name],
    );

    console.log("✅ Admin user created!");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log("\n⚠️  Change your password after first login!");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

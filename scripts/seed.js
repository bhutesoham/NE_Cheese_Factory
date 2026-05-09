#!/usr/bin/env node
// Run with: npm run db:seed
const path = require("path");
const fs = require("fs");

// Load .env.local if present (local dev), otherwise use ECS injected env vars
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  console.log("✅ Found .env.local at:", envPath);
  require("dotenv").config({ path: envPath });
} else {
  console.log("ℹ️ No .env.local found, using environment variables from ECS");
}

// Build connection from individual params (avoids special char encoding issues in URLs)
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || "kaaswinkel";
const DB_PORT = process.env.DB_PORT || 5432;

console.log("🔍 DB_HOST:", DB_HOST);
console.log("🔍 DB_USER:", DB_USER);
console.log("🔍 DB_NAME:", DB_NAME);

if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
  console.error("\n❌ DB_HOST, DB_USER or DB_PASSWORD is missing.");
  console.error(
    "Make sure these are set in .env.local or injected by ECS secrets.\n",
  );
  process.exit(1);
}

const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  ssl: { rejectUnauthorized: false },
});

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

#!/usr/bin/env node
// Run with: npm run db:migrate
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

const pool = new Pool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  console.log("🐘 Connecting to PostgreSQL...");
  const client = await pool.connect();
  try {
    const sqlFile = path.join(__dirname, "..", "sql", "001_schema.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");
    console.log("📦 Running migrations...");
    await client.query(sql);
    console.log("✅ Database schema created successfully!");
    console.log(
      '\nNext step: run "npm run db:seed" to create your admin account.',
    );
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

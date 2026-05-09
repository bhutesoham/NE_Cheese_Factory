#!/usr/bin/env node
// Run with: npm run db:migrate
const path = require("path");
const fs = require("fs");

// Load .env.local using absolute path so it works regardless of
// which directory the user runs the command from
const envPath = path.resolve(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  console.log("✅ Found .env.local at:", envPath);
  require("dotenv").config({ path: envPath });
} else {
  console.error("❌ .env.local NOT FOUND at:", envPath);
  console.error("\nFiles visible in project root:");
  const rootDir = path.resolve(__dirname, "..");
  fs.readdirSync(rootDir).forEach((f) => console.error("   " + f));
  console.error(
    "\nFix: create a file called .env.local in the project root folder",
  );
  console.error("(same folder as package.json) containing:");
  console.error(
    "  DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kaaswinkel\n",
  );
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
  console.error(
    "\n❌ DATABASE_URL is missing or still has placeholder values in .env.local",
  );
  console.error(
    "Set it like: DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/kaaswinkel\n",
  );
  process.exit(1);
}

try {
  new URL(DB_URL);
} catch {
  console.error("\n❌ DATABASE_URL has an invalid format:", DB_URL);
  console.error(
    "Expected: postgresql://username:password@localhost:5432/kaaswinkel",
  );
  console.error(
    "If your password contains special characters like # @ use %23 or %40 instead.\n",
  );
  process.exit(1);
}

const { Pool } = require("pg");

const pool = new Pool({ connectionString: DB_URL });

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

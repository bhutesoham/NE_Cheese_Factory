#!/usr/bin/env node
const path = require('path')
const fs = require('fs')

const envPath = path.resolve(__dirname, '..', '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found')
  process.exit(1)
}
require('dotenv').config({ path: envPath })

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// Get email and password from command line args
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('Usage: node scripts/reset-password.js <email> <password>')
  console.log('Example: node scripts/reset-password.js admin@gmail.com MyPassword123')
  process.exit(1)
}

async function reset() {
  const client = await pool.connect()
  try {
    console.log(`\nResetting password for: ${email}`)
    const hash = await bcrypt.hash(password, 12)

    // Check if user exists
    const existing = await client.query('SELECT id, email FROM admin_users WHERE email = $1', [email.toLowerCase()])

    if (existing.rows.length === 0) {
      // Create new admin user
      await client.query(
        'INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3)',
        [email.toLowerCase(), hash, 'Admin']
      )
      console.log('✅ New admin user created!')
    } else {
      // Update existing
      await client.query(
        'UPDATE admin_users SET password_hash = $1 WHERE email = $2',
        [hash, email.toLowerCase()]
      )
      console.log('✅ Password updated successfully!')
    }

    console.log(`\nYou can now log in with:`)
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

reset()

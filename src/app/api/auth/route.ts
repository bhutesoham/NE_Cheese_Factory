import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

interface AdminUser {
  id: string
  email: string
  name: string | null
  password_hash: string
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const user = await queryOne<AdminUser>(
      `SELECT * FROM admin_users WHERE email = $1`,
      [email.toLowerCase().trim()]
    )

    if (!user) {
      await bcrypt.compare(password, '$2b$12$invalidhashfortimingprotection000000000000000')
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name })
    const response = NextResponse.json({ success: true, name: user.name })
    response.cookies.set('kaaswinkel_admin', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('kaaswinkel_admin', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  return response
}

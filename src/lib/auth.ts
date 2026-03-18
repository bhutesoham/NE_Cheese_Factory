import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { AdminSession } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this'
const COOKIE_NAME = 'kaaswinkel_admin'

export function signToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPostalCode(code: string): boolean {
  // Dutch postal code: 1234 AB
  return /^\d{4}\s?[A-Z]{2}$/i.test(code)
}

export function isValidPhone(phone: string): boolean {
  return /^[\+\d\s\-\(\)]{8,20}$/.test(phone)
}

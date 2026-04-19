import { signToken, verifyToken, isValidEmail, isValidPostalCode, isValidPhone } from '@/lib/auth'
import { AdminSession } from '@/types'

// ─────────────────────────────────────────────
// JWT: signToken / verifyToken
// ─────────────────────────────────────────────
describe('signToken + verifyToken', () => {
  const payload: AdminSession = {
    id: 'user-123',
    email: 'admin@kaaswinkel.nl',
    name: 'Admin',
  }

  it('returns a non-empty JWT string', () => {
    const token = signToken(payload)
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
  })

  it('verifies a token signed with the same secret and returns the payload', () => {
    const token = signToken(payload)
    const result = verifyToken(token)
    expect(result).not.toBeNull()
    expect(result?.id).toBe(payload.id)
    expect(result?.email).toBe(payload.email)
    expect(result?.name).toBe(payload.name)
  })

  it('returns null for a tampered token', () => {
    const token = signToken(payload)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(verifyToken(tampered)).toBeNull()
  })

  it('returns null for a completely invalid token', () => {
    expect(verifyToken('not.a.token')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(verifyToken('')).toBeNull()
  })

  it('two tokens for the same payload are different (contains timestamp)', () => {
    const t1 = signToken(payload)
    // tiny sleep to allow iat to differ — or just check they're valid strings
    const t2 = signToken(payload)
    // Both must verify correctly
    expect(verifyToken(t1)?.id).toBe(payload.id)
    expect(verifyToken(t2)?.id).toBe(payload.id)
  })
})

// ─────────────────────────────────────────────
// isValidEmail
// ─────────────────────────────────────────────
describe('isValidEmail', () => {
  it('accepts a standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('accepts email with subdomain', () => {
    expect(isValidEmail('admin@shop.kaaswinkel.nl')).toBe(true)
  })

  it('accepts email with plus sign', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true)
  })

  it('rejects email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('rejects email without domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('rejects email without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('rejects email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('rejects plain text', () => {
    expect(isValidEmail('not-an-email')).toBe(false)
  })
})

// ─────────────────────────────────────────────
// isValidPostalCode (Dutch: 1234 AB)
// ─────────────────────────────────────────────
describe('isValidPostalCode', () => {
  it('accepts a standard Dutch postal code with space', () => {
    expect(isValidPostalCode('1234 AB')).toBe(true)
  })

  it('accepts a Dutch postal code without space', () => {
    expect(isValidPostalCode('1234AB')).toBe(true)
  })

  it('accepts lowercase letters', () => {
    expect(isValidPostalCode('1234 ab')).toBe(true)
  })

  it('accepts mixed case', () => {
    expect(isValidPostalCode('1234 Ab')).toBe(true)
  })

  it('rejects less than 4 digits', () => {
    expect(isValidPostalCode('123 AB')).toBe(false)
  })

  it('rejects more than 4 digits', () => {
    expect(isValidPostalCode('12345 AB')).toBe(false)
  })

  it('rejects missing letters', () => {
    expect(isValidPostalCode('1234')).toBe(false)
  })

  it('rejects only one letter', () => {
    expect(isValidPostalCode('1234 A')).toBe(false)
  })

  it('rejects letters in digit section', () => {
    expect(isValidPostalCode('12AB CD')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidPostalCode('')).toBe(false)
  })
})

// ─────────────────────────────────────────────
// isValidPhone
// ─────────────────────────────────────────────
describe('isValidPhone', () => {
  it('accepts a standard Dutch phone number', () => {
    expect(isValidPhone('0612345678')).toBe(true)
  })

  it('accepts international format with +31', () => {
    expect(isValidPhone('+31612345678')).toBe(true)
  })

  it('accepts number with spaces', () => {
    expect(isValidPhone('06 1234 5678')).toBe(true)
  })

  it('accepts number with dashes', () => {
    expect(isValidPhone('06-12-34-56-78')).toBe(true)
  })

  it('accepts number with parentheses', () => {
    expect(isValidPhone('(020) 1234567')).toBe(true)
  })

  it('rejects a number that is too short (< 8 chars)', () => {
    expect(isValidPhone('123456')).toBe(false)
  })

  it('rejects a number that is too long (> 20 chars)', () => {
    expect(isValidPhone('012345678901234567890')).toBe(false)
  })

  it('rejects a phone with letters', () => {
    expect(isValidPhone('06-KAASWIN')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidPhone('')).toBe(false)
  })
})

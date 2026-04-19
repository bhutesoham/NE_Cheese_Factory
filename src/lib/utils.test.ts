import {
  formatPrice,
  formatDate,
  formatDateTime,
  slugify,
  generateOrderNumber,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  DELIVERY_COST,
  FREE_DELIVERY_THRESHOLD,
} from '@/lib/utils'

// ─────────────────────────────────────────────
// formatPrice
// ─────────────────────────────────────────────
describe('formatPrice', () => {
  it('formats a whole number as EUR currency', () => {
    expect(formatPrice(10)).toMatch(/€\s?10/)
  })

  it('formats a decimal price correctly', () => {
    expect(formatPrice(3.95)).toMatch(/3[.,]95/)
  })

  it('formats zero as €0', () => {
    expect(formatPrice(0)).toMatch(/€\s?0/)
  })

  it('formats large prices correctly', () => {
    expect(formatPrice(1000)).toMatch(/1[.,]000/)
  })
})

// ─────────────────────────────────────────────
// formatDate
// ─────────────────────────────────────────────
describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-03-15'))
    expect(result).toMatch(/March/)
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/15/)
  })

  it('formats a date string', () => {
    const result = formatDate('2024-01-01')
    expect(result).toMatch(/January/)
    expect(result).toMatch(/2024/)
  })

  it('does not throw for valid date strings', () => {
    expect(() => formatDate('2023-12-31')).not.toThrow()
  })
})

// ─────────────────────────────────────────────
// formatDateTime
// ─────────────────────────────────────────────
describe('formatDateTime', () => {
  it('includes time (hours and minutes)', () => {
    const result = formatDateTime('2024-03-15T14:30:00')
    // Should contain something like "14:30" or "2:30"
    expect(result).toMatch(/\d{1,2}:\d{2}/)
  })

  it('includes the date', () => {
    const result = formatDateTime('2024-06-20T09:00:00')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/20/)
  })
})

// ─────────────────────────────────────────────
// slugify
// ─────────────────────────────────────────────
describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Gouda')).toBe('gouda')
  })

  it('replaces spaces with hyphens', () => {
    expect(slugify('Old Amsterdam')).toBe('old-amsterdam')
  })

  it('removes leading and trailing hyphens', () => {
    expect(slugify('  gouda  ')).toBe('gouda')
  })

  it('handles Dutch/accented characters', () => {
    expect(slugify('Boerenkaas')).toBe('boerenkaas')
    expect(slugify('Léon')).toBe('leon')
    expect(slugify('Ürsel')).toBe('ursel')
    expect(slugify('João')).toBe('joao')
  })

  it('collapses multiple special chars into a single hyphen', () => {
    expect(slugify('kaas -- winkel')).toBe('kaas-winkel')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles string with only special chars', () => {
    expect(slugify('!!!###')).toBe('')
  })

  it('handles ñ and ç', () => {
    expect(slugify('niño')).toBe('nino')
    expect(slugify('façade')).toBe('facade')
  })
})

// ─────────────────────────────────────────────
// generateOrderNumber
// ─────────────────────────────────────────────
describe('generateOrderNumber', () => {
  it('starts with CS', () => {
    expect(generateOrderNumber()).toMatch(/^CS/)
  })

  it('has the correct length (CS + 2 digit year + 2 digit month + 4 digit random = 10 chars)', () => {
    expect(generateOrderNumber()).toHaveLength(10)
  })

  it('contains a 4-digit random number at the end', () => {
    const num = generateOrderNumber()
    const randomPart = num.slice(6) // last 4 chars
    expect(randomPart).toMatch(/^\d{4}$/)
    expect(parseInt(randomPart)).toBeGreaterThanOrEqual(1000)
    expect(parseInt(randomPart)).toBeLessThanOrEqual(9999)
  })

  it('generates unique order numbers', () => {
    const numbers = new Set(Array.from({ length: 100 }, () => generateOrderNumber()))
    // With 9000 possible randoms, 100 should almost certainly be unique
    expect(numbers.size).toBeGreaterThan(90)
  })
})

// ─────────────────────────────────────────────
// ORDER_STATUS_LABELS
// ─────────────────────────────────────────────
describe('ORDER_STATUS_LABELS', () => {
  const expectedStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

  it('has a label for every status', () => {
    expectedStatuses.forEach(status => {
      expect(ORDER_STATUS_LABELS[status]).toBeDefined()
      expect(ORDER_STATUS_LABELS[status].length).toBeGreaterThan(0)
    })
  })

  it('has correct labels', () => {
    expect(ORDER_STATUS_LABELS.pending).toBe('Pending')
    expect(ORDER_STATUS_LABELS.confirmed).toBe('Confirmed')
    expect(ORDER_STATUS_LABELS.cancelled).toBe('Cancelled')
  })
})

// ─────────────────────────────────────────────
// ORDER_STATUS_COLORS
// ─────────────────────────────────────────────
describe('ORDER_STATUS_COLORS', () => {
  const expectedStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled']

  it('has a color class for every status', () => {
    expectedStatuses.forEach(status => {
      expect(ORDER_STATUS_COLORS[status]).toBeDefined()
    })
  })

  it('color classes include both bg and text classes', () => {
    expectedStatuses.forEach(status => {
      expect(ORDER_STATUS_COLORS[status]).toMatch(/bg-/)
      expect(ORDER_STATUS_COLORS[status]).toMatch(/text-/)
    })
  })
})

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
describe('Delivery constants', () => {
  it('DELIVERY_COST is a positive number', () => {
    expect(DELIVERY_COST).toBeGreaterThan(0)
    expect(typeof DELIVERY_COST).toBe('number')
  })

  it('FREE_DELIVERY_THRESHOLD is greater than DELIVERY_COST', () => {
    expect(FREE_DELIVERY_THRESHOLD).toBeGreaterThan(DELIVERY_COST)
  })

  it('DELIVERY_COST is 3.95', () => {
    expect(DELIVERY_COST).toBe(3.95)
  })

  it('FREE_DELIVERY_THRESHOLD is 25', () => {
    expect(FREE_DELIVERY_THRESHOLD).toBe(25)
  })
})

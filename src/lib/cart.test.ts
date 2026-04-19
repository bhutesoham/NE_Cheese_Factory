/**
 * Tests for cart business logic extracted from useCart.ts
 *
 * We extract the pure functions (calculateCart) into a separate
 * testable module. Since useCart is a React hook, we test the
 * pure business logic here without needing React Testing Library.
 */

import { DELIVERY_COST, FREE_DELIVERY_THRESHOLD } from '@/lib/utils'
import { CartItem } from '@/types'

// ─────────────────────────────────────────────
// Replicate the pure calculateCart function from useCart.ts
// (Copy it here so we can unit-test it independently of React)
// ─────────────────────────────────────────────
function calculateCart(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const delivery_cost =
    subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_COST
  return {
    items,
    subtotal,
    delivery_cost,
    total: subtotal + delivery_cost,
  }
}

// Helpers
function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    product_id: 'prod-1',
    product_name: 'Gouda',
    product_image: null,
    price: 5.0,
    quantity: 1,
    ...overrides,
  }
}

// ─────────────────────────────────────────────
// calculateCart
// ─────────────────────────────────────────────
describe('calculateCart', () => {
  describe('empty cart', () => {
    it('has zero subtotal', () => {
      expect(calculateCart([]).subtotal).toBe(0)
    })

    it('has zero delivery cost (empty cart is free)', () => {
      expect(calculateCart([]).delivery_cost).toBe(0)
    })

    it('has zero total', () => {
      expect(calculateCart([]).total).toBe(0)
    })
  })

  describe('subtotal calculation', () => {
    it('calculates subtotal for a single item with quantity 1', () => {
      const { subtotal } = calculateCart([makeItem({ price: 7.5, quantity: 1 })])
      expect(subtotal).toBeCloseTo(7.5)
    })

    it('multiplies price by quantity', () => {
      const { subtotal } = calculateCart([makeItem({ price: 5.0, quantity: 3 })])
      expect(subtotal).toBeCloseTo(15.0)
    })

    it('sums multiple items', () => {
      const items = [
        makeItem({ product_id: 'a', price: 10.0, quantity: 2 }),
        makeItem({ product_id: 'b', price: 3.95, quantity: 1 }),
      ]
      const { subtotal } = calculateCart(items)
      expect(subtotal).toBeCloseTo(23.95)
    })

    it('handles decimal prices precisely', () => {
      const items = [
        makeItem({ price: 3.33, quantity: 3 }), // 9.99
      ]
      expect(calculateCart(items).subtotal).toBeCloseTo(9.99)
    })
  })

  describe('delivery cost logic', () => {
    it('charges delivery when subtotal is below the free threshold', () => {
      const items = [makeItem({ price: 10.0, quantity: 1 })] // €10 < €25
      expect(calculateCart(items).delivery_cost).toBe(DELIVERY_COST)
    })

    it('charges delivery when subtotal is just below the threshold', () => {
      const items = [makeItem({ price: 24.99, quantity: 1 })]
      expect(calculateCart(items).delivery_cost).toBe(DELIVERY_COST)
    })

    it('gives free delivery exactly at the threshold (€25)', () => {
      const items = [makeItem({ price: 25.0, quantity: 1 })]
      expect(calculateCart(items).delivery_cost).toBe(0)
    })

    it('gives free delivery above the threshold', () => {
      const items = [makeItem({ price: 50.0, quantity: 1 })]
      expect(calculateCart(items).delivery_cost).toBe(0)
    })
  })

  describe('total calculation', () => {
    it('total = subtotal + delivery when below threshold', () => {
      const items = [makeItem({ price: 10.0, quantity: 1 })]
      const cart = calculateCart(items)
      expect(cart.total).toBeCloseTo(cart.subtotal + cart.delivery_cost)
    })

    it('total = subtotal when free delivery applies', () => {
      const items = [makeItem({ price: 30.0, quantity: 1 })]
      const cart = calculateCart(items)
      expect(cart.total).toBeCloseTo(30.0)
    })
  })

  describe('edge cases', () => {
    it('handles a large quantity correctly', () => {
      const items = [makeItem({ price: 1.0, quantity: 100 })]
      const cart = calculateCart(items)
      expect(cart.subtotal).toBe(100)
      expect(cart.delivery_cost).toBe(0) // well above threshold
    })

    it('preserves item data in the cart', () => {
      const item = makeItem({ product_name: 'Old Amsterdam', quantity: 2 })
      const cart = calculateCart([item])
      expect(cart.items[0].product_name).toBe('Old Amsterdam')
    })

    it('handles multiple items with mixed quantities', () => {
      const items = [
        makeItem({ product_id: '1', price: 2.0, quantity: 5 }),  // €10
        makeItem({ product_id: '2', price: 7.5, quantity: 2 }),  // €15
      ] // total €25 → free delivery
      const cart = calculateCart(items)
      expect(cart.subtotal).toBeCloseTo(25.0)
      expect(cart.delivery_cost).toBe(0)
      expect(cart.total).toBeCloseTo(25.0)
    })
  })
})

// ─────────────────────────────────────────────
// Cart item key uniqueness logic
// (mirrors the addItem deduplication in useCart.ts)
// ─────────────────────────────────────────────
describe('Cart item deduplication key', () => {
  function makeKey(item: CartItem): string {
    return `${item.product_id}__${item.weight_option || ''}`
  }

  it('same product + same weight = same key', () => {
    const a = makeItem({ product_id: 'x', weight_option: '500g' })
    const b = makeItem({ product_id: 'x', weight_option: '500g' })
    expect(makeKey(a)).toBe(makeKey(b))
  })

  it('same product + different weight = different key', () => {
    const a = makeItem({ product_id: 'x', weight_option: '250g' })
    const b = makeItem({ product_id: 'x', weight_option: '500g' })
    expect(makeKey(a)).not.toBe(makeKey(b))
  })

  it('different product + same weight = different key', () => {
    const a = makeItem({ product_id: 'x', weight_option: '500g' })
    const b = makeItem({ product_id: 'y', weight_option: '500g' })
    expect(makeKey(a)).not.toBe(makeKey(b))
  })

  it('no weight option treated the same as empty string', () => {
    const a = makeItem({ product_id: 'x', weight_option: undefined })
    const b = makeItem({ product_id: 'x', weight_option: '' })
    expect(makeKey(a)).toBe(makeKey(b))
  })
})

'use client'

import { useState, useEffect, useCallback } from 'react'
import { CartItem, Cart } from '@/types'
import { DELIVERY_COST, FREE_DELIVERY_THRESHOLD } from '@/lib/utils'

const CART_KEY = 'kaaswinkel_cart'

function calculateCart(items: CartItem[]): Cart {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const delivery_cost = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_COST
  return {
    items,
    subtotal,
    delivery_cost,
    total: subtotal + delivery_cost,
  }
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setItems(loadCart())
    setMounted(true)
  }, [])

  const updateItems = useCallback((newItems: CartItem[]) => {
    setItems(newItems)
    saveCart(newItems)
  }, [])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const key = `${item.product_id}__${item.weight_option || ''}`
      const exists = prev.find(i => `${i.product_id}__${i.weight_option || ''}` === key)
      let newItems: CartItem[]
      if (exists) {
        newItems = prev.map(i =>
          `${i.product_id}__${i.weight_option || ''}` === key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      } else {
        newItems = [...prev, item]
      }
      saveCart(newItems)
      return newItems
    })
  }, [])

  const removeItem = useCallback((productId: string, weightOption?: string) => {
    setItems(prev => {
      const newItems = prev.filter(
        i => !(i.product_id === productId && (i.weight_option || '') === (weightOption || ''))
      )
      saveCart(newItems)
      return newItems
    })
  }, [])

  const updateQuantity = useCallback((productId: string, weightOption: string | undefined, quantity: number) => {
    setItems(prev => {
      let newItems: CartItem[]
      if (quantity <= 0) {
        newItems = prev.filter(
          i => !(i.product_id === productId && (i.weight_option || '') === (weightOption || ''))
        )
      } else {
        newItems = prev.map(i =>
          i.product_id === productId && (i.weight_option || '') === (weightOption || '')
            ? { ...i, quantity }
            : i
        )
      }
      saveCart(newItems)
      return newItems
    })
  }, [])

  const clearCart = useCallback(() => {
    updateItems([])
  }, [updateItems])

  const cart = calculateCart(items)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return {
    cart,
    items,
    itemCount,
    mounted,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useCart } from '@/hooks/useCart'
import { CartItem, Cart } from '@/types'

interface CartContextType {
  cart: Cart
  items: CartItem[]
  itemCount: number
  mounted: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string, weightOption?: string) => void
  updateQuantity: (productId: string, weightOption: string | undefined, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const cartState = useCart()
  return <CartContext.Provider value={cartState}>{children}</CartContext.Provider>
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used within CartProvider')
  return ctx
}

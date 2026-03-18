import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/CartContext'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'The Cheese Shop – Artisan Cheeses',
    template: '%s | The Cheese Shop',
  },
  description: 'Fresh artisan cheeses delivered to your door. Gouda, farmhouse cheese, sheep cheese and more.',
  keywords: ['cheese', 'artisan', 'farmhouse cheese', 'gouda', 'Netherlands'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'The Cheese Shop',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="font-sans bg-cream-50 text-earth-900 antialiased" suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}

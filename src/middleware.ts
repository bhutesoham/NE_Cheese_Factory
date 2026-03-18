import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for login page, API routes, and redirect page
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/redirect' ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('kaaswinkel_admin')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    const session = verifyToken(token)
    if (!session) {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      // Clear invalid cookie
      res.cookies.set('kaaswinkel_admin', '', { expires: new Date(0), path: '/' })
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

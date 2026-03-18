import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  // Do nothing — let each route handle its own auth
  return NextResponse.next()
}

export const config = {
  matcher: [],
}

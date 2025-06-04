// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const Token = process.env.TOKEN_KEY
  const token = request.cookies.get(Token)?.value
  const { pathname } = request.nextUrl

  if (['/login', '/register'].includes(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
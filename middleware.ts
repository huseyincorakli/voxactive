import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') ||request.headers.get('x-forwarded-for')
  console.log(ip);
  
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/:path*', 
    '/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)', 
  ],
}
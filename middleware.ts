import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')
  // API isteklerini middleware'dan hariç tut
  if (request.nextUrl.pathname.startsWith('/api/usage')) {
    return NextResponse.next()
  }

  const apiKey = process.env.API_SECRET_KEY
  const url = process.env.NEXT_PUBLIC_BASE_URL
  console.log('Attempting to track usage for IP:', ip)
  console.log('API URL:', `${url}/api/usage`)
  try {
    await fetch(`${url}/api/usage`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey!
      },
      body: JSON.stringify({ ip })
    })
  } catch (error) {
    console.error('Usage tracking failed:', error)
  }

  return NextResponse.next()
}


// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/:path*', 
    '/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)', 
  ],
}
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Gerçek IP adresini al
  const realIp = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim()
  console.log('Gerçek IP:', realIp)
  
  // Response objesini oluştur
  const response = NextResponse.next()
  
  // Cookie'den mevcut IP'yi oku
  const cookieIp = request.cookies.get('user_ip')?.value
  
  // IP kontrolü ve cookie işlemleri
  if (realIp) {
    if (!cookieIp) {
      // Cookie'de IP yoksa ekle
      console.log('Yeni IP cookie eklendi:', realIp)
      response.cookies.set('user_ip', realIp, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 hafta
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      })
    } else if (cookieIp !== realIp) {
      // IP değişmişse güncelle
      console.log('IP değişti, cookie güncellendi:', cookieIp, '->', realIp)
      response.cookies.set('user_ip', realIp, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
      })
    } else {
      console.log('IP aynı, cookie güncellenmedi')
    }
  } else {
    console.log('Gerçek IP belirlenemedi')
  }

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/api/:path*', 
    '/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)', 
  ],
}
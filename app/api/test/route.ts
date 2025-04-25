import { NextResponse } from "next/server";

const serverIp = '43.80.54.62';

export async function GET(request: Request) {
    // 'X-Forwarded-For' başlığını al
    const clientIp = request.headers.get('x-forwarded-for');
    
    // Eğer IP birden fazla IP içeriyorsa, ilkini alalım
    const realIp = clientIp ? clientIp.split(',')[0] : '';
  
    // Sunucu IP'sini kontrol et
    if (realIp === serverIp) {
      return NextResponse.json({
        message: 'Request accepted',
        userIp: realIp, // Kullanıcının gerçek IP adresini burada alıyoruz
      });
    }
  
    // Eğer IP başka bir IP ise (sunucu dışında bir yerden geldiyse), reddediyoruz
    return NextResponse.json({ error: 'Forbidden: Only requests from the server are allowed.' }, { status: 403 });
  }
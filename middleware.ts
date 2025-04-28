import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encrypt, setIpCookieIfChanged } from "./lib/utils";

export async function middleware(request: NextRequest) {
  // Eğer zaten limit-reached sayfasına yönlendiriliyorsa, işlemi durdur
  if (request.nextUrl.pathname === "/limit-reached") {
    return NextResponse.next();
  }

  const realIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const response = NextResponse.next();

  // Production için güvenli URL oluşturma
  const host = request.headers.get("host") || "";
  const protocol = host.includes("localhost") ? "http:" : "https:";
  const baseUrl = `${protocol}//${host}`;

  console.log("Environment:", process.env.NODE_ENV);
  console.log("Host:", host);
  console.log("Base URL:", baseUrl);

  if (!request.url.includes("/api/check-blocked")) {
    try {
      // Catch içindeki fetch işlemi için mutlak URL oluşturma
      const checkUrl = `${baseUrl}/api/check-blocked?user=${encodeURIComponent(
        encrypt(realIp || "")
      )}`;

      console.log("Fetching URL:", checkUrl);

      // AbortController ile zaman aşımı ekleyelim
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye timeout

      const apiResponse = await fetch(checkUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!apiResponse.ok) {
        throw new Error(`API responded with status: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      console.log("Event sent", data);
      if (data) {
        return NextResponse.redirect(new URL("/limit-reached", baseUrl));
      }
    } catch (error) {
      // Daha detaylı hata yakalama
      console.log(
        "Fetching error: ",
        error instanceof Error ? error.message : String(error)
      );
      // Hata durumunda işleme devam et, middleware'i bloke etme
    }
  }

  setIpCookieIfChanged(realIp, request, response);
  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/check-blocked|limit-reached).*)",
  ],
};

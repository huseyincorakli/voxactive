import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encrypt, setIpCookieIfChanged } from "./lib/utils";

export async function middleware(request: NextRequest) {
  const realIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim();

  const response = NextResponse.next();

  console.log("next url origin", request.nextUrl.origin);

  if (!request.url.includes("/api/test")) {
    fetch(`${request.nextUrl.origin}/api/test?user=${encrypt(realIp)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        // JSON verisini çözümle
        return response.json();
      })
      .then((data) => {
        console.log("Event sent", data); // Burada gelen veri ile işlem yapabilirsiniz
      })
      .catch((error) => {
        console.log("Fetching error: ", error);
      });
  }

  setIpCookieIfChanged(realIp, request, response);

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!$|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/test).*)",
  ],
};

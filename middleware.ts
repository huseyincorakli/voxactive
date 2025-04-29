import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { encrypt, setIpCookieIfChanged } from "./lib/utils";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/limit-reached") {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }
  const realIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  const response = NextResponse.next();

  setIpCookieIfChanged(realIp, request, response);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/check-blocked|limit-reached).*)",
    "/api/((?!check-blocked).+)",
  ],
};

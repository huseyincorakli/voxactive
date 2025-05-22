import { checkBlocked } from "@/lib/db/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = url.searchParams.get("user");
  if (!user) return NextResponse.json(true);
  const decodedUser = decodeURIComponent(user);
  const isBlocked = await checkBlocked(decodedUser);
  return NextResponse.json(isBlocked);
}

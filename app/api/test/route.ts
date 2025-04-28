import { checkBlocked } from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = url.searchParams.get("user");
  const decodedUser = decodeURIComponent(user);
  console.log("Decoded user ID:", decodedUser);
  return NextResponse.json("ok");
}

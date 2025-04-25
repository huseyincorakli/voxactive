import { NextResponse } from "next/server";

const serverIp = '43.80.54.62';

export async function GET(request: Request) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
    return NextResponse.json({ ip });
  }
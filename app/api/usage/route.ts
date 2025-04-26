import { createUsage } from "@/lib/db/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // 1. API Key Kontrolü
  const apiKey = request.headers.get('x-api-key')
  if (apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. IP'yi al ve kullanımı kaydet
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')
  
  try {
    await createUsage(ip!)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { scanReceiptWithGemini } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  const { imageBase64, mediaType } = await request.json() as { imageBase64: string; mediaType: string }
  if (!imageBase64) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

  try {
    const items = await scanReceiptWithGemini(imageBase64, mediaType)
    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { searchProduct } from '@/lib/openfoodfacts'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  if (!query) return NextResponse.json([])
  const products = await searchProduct(query)
  return NextResponse.json(products)
}

import { NextRequest, NextResponse } from 'next/server'
import { getProductByBarcode } from '@/lib/openfoodfacts'

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('code')
  if (!barcode) return NextResponse.json(null)
  const product = await getProductByBarcode(barcode)
  return NextResponse.json(product)
}

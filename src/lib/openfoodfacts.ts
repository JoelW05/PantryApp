export interface OFFProduct {
  code: string
  product_name: string
  brands?: string
  nutriments: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    'fiber_100g'?: number
  }
}

export async function searchProduct(query: string): Promise<OFFProduct[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '10',
    fields: 'code,product_name,brands,nutriments',
    countries_tags: 'en:united-kingdom',
  })
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params}`)
  if (!res.ok) throw new Error(`OFF search: ${res.status}`)
  const data = await res.json()
  return data.products ?? []
}

export async function getProductByBarcode(barcode: string): Promise<OFFProduct | null> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=code,product_name,brands,nutriments`
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.product ?? null
}

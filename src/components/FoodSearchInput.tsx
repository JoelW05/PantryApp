'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, ScanLine, Loader2 } from 'lucide-react'
import BarcodeScanner from './BarcodeScanner'
import { searchCommonFoods, categoryEmoji, type CommonFoodEntry } from '@/lib/commonFoods'

export interface FoodResult {
  name: string
  brand?: string
  calories_per_100g?: number
  protein_per_100g?: number
  carbs_per_100g?: number
  fat_per_100g?: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  saturated_fat_per_100g?: number
  sodium_per_100g?: number
  potassium_per_100g?: number
  calcium_per_100g?: number
  iron_per_100g?: number
  magnesium_per_100g?: number
  zinc_per_100g?: number
  vitamin_a_per_100g?: number
  vitamin_c_per_100g?: number
  vitamin_d_per_100g?: number
  barcode?: string
}

interface Props {
  onSelect: (food: FoodResult) => void
  placeholder?: string
}

interface OFFProduct {
  code: string
  product_name: string
  brands?: string
  nutriments: Record<string, number>
}

function mapOFF(p: OFFProduct): FoodResult {
  const n = p.nutriments
  return {
    name: p.product_name,
    brand: p.brands,
    barcode: p.code,
    calories_per_100g: n['energy-kcal_100g'],
    protein_per_100g: n['proteins_100g'],
    carbs_per_100g: n['carbohydrates_100g'],
    fat_per_100g: n['fat_100g'],
    fiber_per_100g: n['fiber_100g'],
    sugar_per_100g: n['sugars_100g'],
    saturated_fat_per_100g: n['saturated-fat_100g'],
    sodium_per_100g: n['sodium_100g'] != null ? n['sodium_100g'] * 1000 : undefined,
    potassium_per_100g: n['potassium_100g'] != null ? n['potassium_100g'] * 1000 : undefined,
    calcium_per_100g: n['calcium_100g'] != null ? n['calcium_100g'] * 1000 : undefined,
    iron_per_100g: n['iron_100g'] != null ? n['iron_100g'] * 1000 : undefined,
    magnesium_per_100g: n['magnesium_100g'] != null ? n['magnesium_100g'] * 1000 : undefined,
    zinc_per_100g: n['zinc_100g'] != null ? n['zinc_100g'] * 1000 : undefined,
    vitamin_a_per_100g: n['vitamin-a_100g'] != null ? n['vitamin-a_100g'] * 1000000 : undefined,
    vitamin_c_per_100g: n['vitamin-c_100g'] != null ? n['vitamin-c_100g'] * 1000 : undefined,
    vitamin_d_per_100g: n['vitamin-d_100g'] != null ? n['vitamin-d_100g'] * 1000000 : undefined,
  }
}

export default function FoodSearchInput({ onSelect, placeholder = 'Search food or scan barcode…' }: Props) {
  const [query, setQuery] = useState('')
  const [offResults, setOffResults] = useState<FoodResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Common food suggestions — instant, no API needed (includes category)
  const commonMatches: CommonFoodEntry[] = searchCommonFoods(query, 8)

  // Merge: common foods first, then OFF results (deduplicated by name)
  const offNames = new Set(offResults.map(r => r.name.toLowerCase()))
  const combined: Array<{ result: FoodResult; category: string; source: 'common' | 'off' }> = [
    ...commonMatches
      .filter(e => !offNames.has(e.name.toLowerCase()))
      .map(e => ({ result: { name: e.name }, category: e.category, source: 'common' as const })),
    ...offResults.map(r => ({ result: r, category: 'Branded Products', source: 'off' as const })),
  ]

  // Debounced OFF search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.length < 2) {
      setOffResults([])
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/nutrition/search?q=${encodeURIComponent(query)}`)
        const data: OFFProduct[] = await res.json()
        setOffResults(data.filter(p => p.product_name).map(mapOFF))
      } catch {
        setOffResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  async function handleBarcode(code: string) {
    setShowScanner(false)
    setLoading(true)
    const res = await fetch(`/api/nutrition/barcode?code=${encodeURIComponent(code)}`)
    const product: OFFProduct | null = await res.json()
    setLoading(false)
    if (product?.product_name) {
      const food = mapOFF(product)
      onSelect(food)
      setQuery(food.name)
      setOpen(false)
    } else {
      alert(`Barcode ${code} not found in Open Food Facts.`)
    }
  }

  function pick(food: FoodResult) {
    onSelect(food)
    setQuery(food.name)
    setOpen(false)
    setOffResults([])
  }

  const showDropdown = open && query.length >= 1 && (combined.length > 0 || loading)

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={e => {
              if (e.key === 'Enter' && query.trim()) {
                // Pick first result or use typed name
                if (combined.length > 0) pick(combined[0].result)
                else pick({ name: query.trim() })
              }
            }}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          title="Scan barcode"
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
        >
          <ScanLine size={16} />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {(() => {
            // Group items by category — preserves order of first appearance
            const groupMap = new Map<string, typeof combined>()
            for (const item of combined) {
              if (!groupMap.has(item.category)) groupMap.set(item.category, [])
              groupMap.get(item.category)!.push(item)
            }

            const rows: React.ReactNode[] = []
            let itemIndex = 0

            groupMap.forEach((items, category) => {
              // Header — only rendered when the group actually has items
              rows.push(
                <div key={`hdr-${category}`} className="px-3 pt-2.5 pb-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {categoryEmoji(category)} {category}
                  </span>
                </div>
              )
              items.forEach(({ result, source }) => {
                const idx = itemIndex++
                rows.push(
                  <button
                    key={idx}
                    onMouseDown={() => pick(result)}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                      {source === 'off' && result.calories_per_100g != null && (
                        <span className="text-xs text-gray-400 shrink-0">{result.calories_per_100g} kcal/100g</span>
                      )}
                    </div>
                    {source === 'off' && result.brand && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{result.brand}</p>
                    )}
                  </button>
                )
              })
            })

            // "Use typed name" fallback at the bottom
            if (query.trim() && !combined.some(c => c.result.name.toLowerCase() === query.trim().toLowerCase())) {
              rows.push(
                <div key="divider" className="border-t border-gray-100 mt-1" />,
                <button
                  key="custom"
                  onMouseDown={() => pick({ name: query.trim() })}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm text-gray-500">
                    Use <span className="font-medium text-gray-800">&quot;{query.trim()}&quot;</span>
                  </p>
                </button>
              )
            }
            return rows
          })()}
        </div>
      )}

      {showScanner && <BarcodeScanner onDetected={handleBarcode} onClose={() => setShowScanner(false)} />}
    </div>
  )
}

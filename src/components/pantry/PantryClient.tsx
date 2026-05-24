'use client'
import { useState, useRef } from 'react'
import { Trash2, Plus, ReceiptText, X, Search, AlertTriangle, ChevronDown, ChevronRight, Flag, CalendarDays, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import FoodSearchInput, { type FoodResult } from '@/components/FoodSearchInput'
import ReceiptScanner from './ReceiptScanner'
import { autoCategory, PANTRY_CATEGORIES, CATEGORY_EMOJI } from '@/lib/categorize'
import type { PantryItem, ScannedItem } from '@/types'

// ── Expiry helpers ──────────────────────────────────────────────────────────
function daysUntilExpiry(expiryDate?: string | null): number | null {
  if (!expiryDate) return null
  const diff = new Date(expiryDate).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ExpiryBadge({ days }: { days: number | null }) {
  if (days === null) return null
  if (days < 0) return (
    <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 font-medium whitespace-nowrap">
      Expired
    </span>
  )
  if (days === 0) return (
    <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 font-medium whitespace-nowrap">
      Today
    </span>
  )
  if (days <= 3) return (
    <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-100 text-red-600 font-medium whitespace-nowrap">
      {days}d left
    </span>
  )
  if (days <= 7) return (
    <span className="text-xs px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-600 font-medium whitespace-nowrap">
      {days}d left
    </span>
  )
  return null
}

export default function PantryClient({ initialItems, userId }: { initialItems: PantryItem[]; userId: string }) {
  const supabase = createClient()
  const [items, setItems] = useState<PantryItem[]>(initialItems)
  const [selectedFood, setSelectedFood] = useState<FoodResult | null>(null)
  const [quantity, setQuantity] = useState('100')
  const [unit, setUnit] = useState('g')
  const [category, setCategory] = useState('Other')
  const [expiryDate, setExpiryDate] = useState('')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [filter, setFilter] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set())
  const editRef = useRef<HTMLInputElement>(null)

  function handleFoodSelect(food: FoodResult) {
    setSelectedFood(food)
    setQuantity('100')
    setUnit('g')
    setCategory(autoCategory(food.name))
  }

  async function addItem() {
    if (!selectedFood) return
    const { data, error } = await supabase.from('pantry_items').insert({
      user_id: userId,
      name: selectedFood.name,
      brand: selectedFood.brand ?? null,
      quantity: Number(quantity),
      unit,
      category,
      calories_per_100g: selectedFood.calories_per_100g ?? null,
      protein_per_100g: selectedFood.protein_per_100g ?? null,
      carbs_per_100g: selectedFood.carbs_per_100g ?? null,
      fat_per_100g: selectedFood.fat_per_100g ?? null,
      fiber_per_100g: selectedFood.fiber_per_100g ?? null,
      open_food_facts_id: selectedFood.barcode ?? null,
      expiry_date: expiryDate || null,
    }).select().single()
    if (!error && data) {
      setItems(prev => [data as PantryItem, ...prev])
      setSelectedFood(null)
      setExpiryDate('')
      setShowAddPanel(false)
    }
  }

  async function removeItem(id: string) {
    await supabase.from('pantry_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function startEdit(item: PantryItem) {
    setEditingId(item.id)
    setEditAmount(`${item.quantity}${item.unit}`)
    setTimeout(() => { editRef.current?.select() }, 0)
  }

  async function saveEdit(item: PantryItem) {
    const m = editAmount.trim().match(/^([\d.]+)\s*([a-zA-Z]*)$/)
    const quantity = m ? parseFloat(m[1]) : item.quantity
    const unit = m?.[2] || item.unit
    if (!isNaN(quantity) && quantity > 0) {
      await supabase.from('pantry_items').update({ quantity, unit }).eq('id', item.id)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity, unit } : i))
    }
    setEditingId(null)
  }

  async function clearPantry() {
    await supabase.from('pantry_items').delete().eq('user_id', userId)
    setItems([])
    setShowClearConfirm(false)
  }

  async function addScannedItems(scanned: ScannedItem[]) {
    const rows = scanned.map(item => ({
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: autoCategory(item.name),
    }))
    const { data, error } = await supabase.from('pantry_items').insert(rows).select()
    if (!error && data) setItems(prev => [...(data as PantryItem[]), ...prev])
    setShowScanner(false)
  }

  async function flagItem(item: PantryItem) {
    if (flaggedIds.has(item.id)) return
    await supabase.from('nutrition_flags').insert({
      user_id: userId,
      item_name: item.name,
      open_food_facts_id: item.open_food_facts_id ?? null,
    })
    setFlaggedIds(prev => new Set([...prev, item.id]))
  }

  function toggleCollapse(cat: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const today = new Date().toISOString().split('T')[0]

  const filtered = filter
    ? items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()))
    : items

  // Group by category, preserving PANTRY_CATEGORIES order
  const grouped = PANTRY_CATEGORIES.reduce<Record<string, PantryItem[]>>((acc, cat) => {
    const catItems = filtered.filter(i => (i.category ?? autoCategory(i.name)) === cat)
    if (catItems.length > 0) acc[cat] = catItems
    return acc
  }, {})
  const uncategorised = filtered.filter(i => !PANTRY_CATEGORIES.includes((i.category ?? autoCategory(i.name)) as typeof PANTRY_CATEGORIES[number]))
  if (uncategorised.length > 0) grouped['Other'] = [...(grouped['Other'] ?? []), ...uncategorised]

  // Items expiring within 7 days, sorted soonest first
  const useFirst = items
    .filter(i => { const d = daysUntilExpiry(i.expiry_date); return d !== null && d <= 7 })
    .sort((a, b) => (daysUntilExpiry(a.expiry_date) ?? 0) - (daysUntilExpiry(b.expiry_date) ?? 0))

  const isEmpty = items.length === 0

  return (
    <div className="space-y-4">
      {/* Empty state — prominent receipt scanning CTA */}
      {isEmpty && !showScanner && !showAddPanel && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ReceiptText size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">Start by scanning your receipt</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            Take a photo of a supermarket receipt and we&apos;ll add everything to your pantry automatically.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium shadow-sm transition-colors">
              <ReceiptText size={15} /> Scan receipt
            </button>
            <button onClick={() => setShowAddPanel(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-300 transition-colors">
              <Plus size={15} /> Add manually
            </button>
          </div>
        </div>
      )}

      {/* Action bar — shown when pantry has items */}
      {!isEmpty && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setShowAddPanel(v => !v); setShowScanner(false) }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-600 border border-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <Plus size={15} /> Add item
          </button>
          <button onClick={() => { setShowScanner(v => !v); setShowAddPanel(false) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${showScanner ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}>
            <ReceiptText size={15} /> Scan receipt
          </button>
          <button onClick={() => setShowClearConfirm(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-500 hover:border-red-300 hover:text-red-500 bg-white transition-colors">
            <Trash2 size={14} /> Clear pantry
          </button>
        </div>
      )}

      {/* Add item panel */}
      {showAddPanel && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <span className="text-sm font-semibold text-gray-800">Add item</span>
            <button onClick={() => { setShowAddPanel(false); setSelectedFood(null); setExpiryDate('') }} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
          </div>
          <div className="p-4 space-y-4">
            <FoodSearchInput onSelect={handleFoodSelect} placeholder="Search by food name or scan barcode…" />
            {selectedFood && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedFood.name}</p>
                    {selectedFood.brand && <p className="text-xs text-gray-400">{selectedFood.brand}</p>}
                  </div>
                  {selectedFood.calories_per_100g != null && (
                    <span className="text-xs text-emerald-700">{selectedFood.calories_per_100g} kcal / 100g</span>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-24">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Quantity</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="w-24">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Unit</label>
                    <select value={unit} onChange={e => setUnit(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
                      {['g', 'kg', 'ml', 'L', 'unit', 'tbsp', 'tsp', 'cup'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-36">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
                      {PANTRY_CATEGORIES.map(c => (
                        <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Expiry date */}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <CalendarDays size={11} /> Expiry date <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    min={today}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button onClick={addItem} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium">
                  Add to pantry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showScanner && (
        <ReceiptScanner
          onAdd={addScannedItems}
          onClose={() => setShowScanner(false)}
          existingNames={items.map(i => i.name)}
        />
      )}

      {showClearConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">Remove all {items.length} items from your pantry?</p>
          <button onClick={clearPantry} className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Clear all</button>
          <button onClick={() => setShowClearConfirm(false)} className="px-4 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium">Cancel</button>
        </div>
      )}

      {/* ── Use First section ─────────────────────────────────────────── */}
      {!isEmpty && useFirst.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-amber-200 bg-amber-100/50">
            <Clock size={14} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Use First</span>
            <span className="text-xs text-amber-600 ml-auto">expiring within 7 days</span>
          </div>
          <div className="divide-y divide-amber-100">
            {useFirst.map(item => {
              const days = daysUntilExpiry(item.expiry_date)
              return (
                <div key={item.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">{item.quantity}{item.unit}</span>
                    <ExpiryBadge days={days} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pantry grouped list */}
      {!isEmpty && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filter} onChange={e => setFilter(e.target.value)}
              placeholder={`Search ${items.length} items…`}
              className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-500 shadow-sm" />
          </div>

          {Object.keys(grouped).length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No items match &quot;{filter}&quot;</p>
          ) : (
            Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => toggleCollapse(cat)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{CATEGORY_EMOJI[cat] ?? '📦'}</span>
                    <span className="text-sm font-semibold text-gray-800">{cat}</span>
                    <span className="text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">{catItems.length}</span>
                  </div>
                  {collapsed.has(cat)
                    ? <ChevronRight size={15} className="text-gray-400" />
                    : <ChevronDown size={15} className="text-gray-400" />}
                </button>

                {!collapsed.has(cat) && (
                  <div className="divide-y divide-gray-100">
                    {catItems.map(item => {
                      const days = daysUntilExpiry(item.expiry_date)
                      return (
                        <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                            {item.brand && <span className="text-xs text-gray-400">{item.brand}</span>}
                            {editingId === item.id ? (
                              <input
                                ref={editRef}
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                onBlur={() => saveEdit(item)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveEdit(item)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                className="text-xs text-gray-900 border border-emerald-400 rounded px-2 py-0.5 w-20 focus:outline-none bg-white"
                              />
                            ) : (
                              <button
                                onClick={() => startEdit(item)}
                                className="text-xs text-gray-500 hover:text-emerald-600 hover:underline tabular-nums"
                                title="Click to edit"
                              >
                                {item.quantity}{item.unit}
                              </button>
                            )}
                            <ExpiryBadge days={days} />
                            {item.calories_per_100g && (
                              <span className="text-xs text-gray-300 flex items-center gap-1">
                                {item.calories_per_100g} kcal/100g
                                <button
                                  onClick={() => flagItem(item)}
                                  title={flaggedIds.has(item.id) ? 'Flagged as inaccurate' : 'Flag inaccurate data'}
                                  className={`transition-colors ml-0.5 ${flaggedIds.has(item.id) ? 'text-amber-400 cursor-default' : 'text-gray-200 hover:text-amber-400'}`}>
                                  <Flag size={10} />
                                </button>
                              </span>
                            )}
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { Plus, Sparkles, Trash2, CheckSquare, Square, ShoppingCart, X, PoundSterling } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ShoppingSuggestion, ShoppingItem } from '@/types'

const PRIORITY_CONFIG = {
  high:   { label: 'Must have',    bg: 'bg-red-50 text-red-700 border-red-200',      dot: 'bg-red-400' },
  medium: { label: 'Should have',  bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  low:    { label: 'Nice to have', bg: 'bg-gray-100 text-gray-500 border-gray-200',   dot: 'bg-gray-300' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Meat & Fish': '🥩', 'Dairy & Eggs': '🥛', 'Vegetables': '🥦', 'Fruit': '🍎',
  'Grains & Pasta': '🌾', 'Tinned & Dried': '🥫', 'Condiments & Oils': '🫙', 'Snacks & Breakfast': '🥣',
}

function fmt(n: number) { return `£${n.toFixed(2)}` }

export default function ShoppingClient({
  initialItems, userId, initialBudget, initialSuggestions, initialDismissed,
}: {
  initialItems: ShoppingItem[]
  userId: string
  initialBudget: number
  initialSuggestions: ShoppingSuggestion[]
  initialDismissed: string[]
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<'suggested' | 'mylist'>('suggested')
  const [suggestions, setSuggestions] = useState<ShoppingSuggestion[]>(initialSuggestions)
  const [dismissed, setDismissed] = useState<string[]>(initialDismissed)
  const [loading, setLoading] = useState(false)
  const [listItems, setListItems] = useState<ShoppingItem[]>(initialItems)
  const [newItem, setNewItem] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [budget, setBudget] = useState(initialBudget)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState(String(initialBudget))

  async function regenerate() {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('force', 'true')  // bypass cache — user explicitly requested fresh suggestions
    if (dismissed.length) params.set('dismissed', dismissed.join(','))
    const res = await fetch('/api/shopping/suggest?' + params.toString())
    const data = await res.json()
    setSuggestions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function dismissSuggestion(name: string) {
    const next = [...dismissed, name]
    setDismissed(next)
    setSuggestions(prev => prev.filter(s => s.name !== name))
    await supabase.from('food_preferences').upsert(
      { user_id: userId, dismissed_shopping_names: next },
      { onConflict: 'user_id' }
    )
  }

  async function clearDismissed() {
    setDismissed([])
    await supabase.from('food_preferences').upsert(
      { user_id: userId, dismissed_shopping_names: [] },
      { onConflict: 'user_id' }
    )
  }

  async function saveBudget() {
    const val = parseFloat(budgetInput)
    if (!isNaN(val) && val >= 0) {
      setBudget(val)
      await supabase.from('food_preferences').upsert({ user_id: userId, shopping_budget: val }, { onConflict: 'user_id' })
    }
    setEditingBudget(false)
  }

  async function addToList(s: ShoppingSuggestion) {
    const { data, error } = await supabase.from('shopping_items').insert({
      user_id: userId,
      name: s.name,
      quantity: s.quantity,
      category: s.category,
      price: s.estimatedPrice ?? null,
      checked: false,
    }).select().single()
    if (!error && data) {
      setListItems(prev => [data as ShoppingItem, ...prev])
      setTab('mylist')
    }
  }

  async function addManual() {
    if (!newItem.trim()) return
    const price = newPrice ? parseFloat(newPrice) : null
    const { data, error } = await supabase.from('shopping_items').insert({
      user_id: userId,
      name: newItem.trim(),
      quantity: newQty.trim() || null,
      price: price && !isNaN(price) ? price : null,
      checked: false,
    }).select().single()
    if (!error && data) {
      setListItems(prev => [data as ShoppingItem, ...prev])
      setNewItem(''); setNewQty(''); setNewPrice('')
    }
  }

  async function toggleItem(item: ShoppingItem) {
    await supabase.from('shopping_items').update({ checked: !item.checked }).eq('id', item.id)
    setListItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))
  }

  async function removeItem(id: string) {
    await supabase.from('shopping_items').delete().eq('id', id)
    setListItems(prev => prev.filter(i => i.id !== id))
  }

  async function clearChecked() {
    const ids = listItems.filter(i => i.checked).map(i => i.id)
    await supabase.from('shopping_items').delete().in('id', ids)
    setListItems(prev => prev.filter(i => !i.checked))
  }

  const grouped = suggestions.reduce<Record<string, ShoppingSuggestion[]>>((acc, s) => {
    ;(acc[s.category] = acc[s.category] ?? []).push(s)
    return acc
  }, {})

  const inList = new Set(listItems.map(i => i.name.toLowerCase()))
  const unchecked = listItems.filter(i => !i.checked)
  const checked = listItems.filter(i => i.checked)
  const hasAny = suggestions.length > 0

  const totalEstimated = listItems.filter(i => !i.checked && i.price).reduce((s, i) => s + (i.price ?? 0), 0)
  const budgetPct = budget > 0 ? Math.min((totalEstimated / budget) * 100, 100) : 0
  const overBudget = totalEstimated > budget && budget > 0

  return (
    <div className="space-y-5">

      {/* Budget bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PoundSterling size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-gray-800">Weekly budget</span>
          </div>
          {editingBudget ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">£</span>
              <input
                autoFocus type="number" value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                onBlur={saveBudget}
                onKeyDown={e => e.key === 'Enter' && saveBudget()}
                className="w-24 border border-emerald-400 rounded-lg px-2 py-1 text-sm focus:outline-none"
              />
            </div>
          ) : (
            <button onClick={() => { setEditingBudget(true); setBudgetInput(String(budget)) }}
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 underline decoration-dotted">
              {fmt(budget)}
            </button>
          )}
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className={overBudget ? 'text-red-500 font-medium' : 'text-gray-500'}>
              {fmt(totalEstimated)} estimated in list
            </span>
            <span className="text-gray-400">{fmt(Math.max(0, budget - totalEstimated))} remaining</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${overBudget ? 'bg-red-400' : 'bg-emerald-500'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['suggested', 'mylist'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'suggested' ? 'AI Suggestions' : `My List (${listItems.length})`}
          </button>
        ))}
      </div>

      {/* ── Suggestions tab ───────────────────────────────────────────── */}
      {tab === 'suggested' && (
        <div className="space-y-4">

          {/* Filter legend + controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              ))}
            </div>
            {hasAny && (
              <button
                onClick={regenerate}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 border border-gray-300 hover:border-emerald-400 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
                <Sparkles size={11} className={loading ? 'animate-pulse' : ''} />
                {loading ? 'Generating…' : 'Regenerate'}
              </button>
            )}
          </div>

          {/* Dismissed count */}
          {dismissed.length > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <X size={11} />
              {dismissed.length} suggestion{dismissed.length !== 1 ? 's' : ''} hidden
              <button onClick={clearDismissed} className="underline text-emerald-600 ml-1">Clear</button>
            </p>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse text-emerald-500" />
                AI is generating personalised suggestions…
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasAny && (
            <div className="text-center py-20 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium text-gray-600 mb-1">No suggestions yet</p>
              <p className="text-xs text-gray-400 mb-5">
                We&apos;ll look at your pantry and nutrition gaps to recommend what to buy.
              </p>
              <button onClick={regenerate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm">
                <Sparkles size={14} /> Get AI Suggestions
              </button>
            </div>
          )}

          {/* Suggestion grid */}
          {!loading && hasAny && (
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>{CATEGORY_EMOJI[category] ?? '🛒'}</span> {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {items.map((item, i) => {
                      const cfg = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.low
                      const already = inList.has(item.name.toLowerCase())
                      return (
                        <div key={i} className="relative group bg-white border border-gray-200 rounded-xl p-3 flex items-start gap-3 shadow-sm">
                          {/* Dismiss button */}
                          <button
                            onClick={() => dismissSuggestion(item.name)}
                            title="Don't suggest this again"
                            className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-black/20 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={10} />
                          </button>

                          <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <span className="text-sm font-semibold text-gray-700 shrink-0">
                                {item.estimatedPrice != null ? fmt(item.estimatedPrice) : ''}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{item.quantity}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className={`text-xs border rounded-full px-2 py-0.5 ${cfg.bg}`}>{cfg.label}</span>
                              <p className="text-xs text-gray-400 italic line-clamp-1 ml-2 flex-1 text-right">{item.reason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => !already && addToList(item)}
                            disabled={already}
                            className={`shrink-0 p-1.5 rounded-lg transition-colors self-center ${already ? 'text-emerald-500 cursor-default' : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                            title={already ? 'Already in list' : 'Add to list'}>
                            {already ? <CheckSquare size={16} /> : <Plus size={16} />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── My List tab ───────────────────────────────────────────────── */}
      {tab === 'mylist' && (
        <div className="space-y-4">
          {/* Add manual item */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-600 mb-3">Add item manually</p>
            <div className="flex gap-2">
              <input value={newItem} onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                placeholder="Item name…"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500" />
              <input value={newQty} onChange={e => setNewQty(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addManual()}
                placeholder="Qty"
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500" />
              <div className="relative w-24">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                <input value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addManual()}
                  placeholder="0.00" type="number" step="0.01"
                  className="w-full border border-gray-300 rounded-lg pl-7 pr-2 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500" />
              </div>
              <button onClick={addManual} disabled={!newItem.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                <Plus size={15} />
              </button>
            </div>
          </div>

          {listItems.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Your list is empty.</p>
              <button onClick={() => setTab('suggested')} className="mt-2 text-emerald-600 text-sm underline">
                Browse AI suggestions →
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-[24px_1fr_60px_60px_28px] gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span /><span className="text-xs font-medium text-gray-400">Item</span>
                <span className="text-xs font-medium text-gray-400">Qty</span>
                <span className="text-xs font-medium text-gray-400 text-right">Price</span>
                <span />
              </div>

              {unchecked.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {unchecked.map(item => (
                    <div key={item.id} className="grid grid-cols-[24px_1fr_60px_60px_28px] gap-2 items-center px-4 py-3">
                      <button onClick={() => toggleItem(item)} className="text-gray-300 hover:text-emerald-500 transition-colors">
                        <Square size={18} />
                      </button>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        {item.category && <p className="text-xs text-gray-400">{CATEGORY_EMOJI[item.category] ?? ''} {item.category}</p>}
                      </div>
                      <span className="text-xs text-gray-500 truncate">{item.quantity ?? '—'}</span>
                      <span className="text-sm font-medium text-gray-700 text-right">
                        {item.price != null ? fmt(item.price) : <span className="text-gray-300">—</span>}
                      </span>
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors justify-self-end">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {unchecked.some(i => i.price != null) && (
                <div className={`px-4 py-3 border-t flex items-center justify-between ${overBudget ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <span className="text-sm font-semibold text-gray-700">Estimated total</span>
                  <span className={`text-sm font-bold ${overBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                    {fmt(totalEstimated)}
                    {budget > 0 && <span className="text-xs font-normal ml-1 opacity-70">of {fmt(budget)} budget</span>}
                  </span>
                </div>
              )}

              {checked.length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{checked.length} item{checked.length !== 1 ? 's' : ''} in trolley</p>
                    <button onClick={clearChecked} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                      <Trash2 size={11} /> Clear
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {checked.map(item => (
                      <div key={item.id} className="grid grid-cols-[24px_1fr_60px_60px_28px] gap-2 items-center px-4 py-3 opacity-50">
                        <button onClick={() => toggleItem(item)} className="text-emerald-500">
                          <CheckSquare size={18} />
                        </button>
                        <span className="text-sm text-gray-500 line-through truncate">{item.name}</span>
                        <span className="text-xs text-gray-400">{item.quantity ?? '—'}</span>
                        <span className="text-sm text-gray-400 text-right">{item.price != null ? fmt(item.price) : '—'}</span>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors justify-self-end">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

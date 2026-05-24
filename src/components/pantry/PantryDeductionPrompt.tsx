'use client'
import { useState } from 'react'
import { CheckSquare, Square, Minus, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { PantryItem } from '@/types'

interface ParsedIngredient {
  raw: string
  name: string
  quantity: number
  unit: string
}

interface Match {
  ingredient: ParsedIngredient
  pantryItem: PantryItem
  subtract: number
  checked: boolean
}

interface StaleItem {
  id: string
  name: string
  added_at: string
}

interface Props {
  userId: string
  ingredients: string[]
  loggedServings: number
  recipeServings: number
  onDone: () => void
}

function parseFraction(s: string): number {
  if (s.includes('/')) {
    const [n, d] = s.split('/')
    return parseFloat(n) / parseFloat(d)
  }
  return parseFloat(s)
}

function parseIngredient(raw: string): ParsedIngredient {
  const m = raw.match(/^([\d./]+)\s*(g|kg|ml|l|L|tbsp|tsp|cup|oz)?\s+(.+)/i)
  if (m) {
    return {
      raw,
      name: m[3].replace(/,.*$/, '').toLowerCase().trim(),
      quantity: parseFraction(m[1]) || 1,
      unit: m[2]?.toLowerCase() || 'g',
    }
  }
  return { raw, name: raw.toLowerCase().trim(), quantity: 1, unit: 'unit' }
}

function matchScore(ingName: string, pantryName: string): number {
  const a = ingName.toLowerCase()
  const b = pantryName.toLowerCase()
  if (a === b) return 100
  if (a.includes(b) || b.includes(a)) return 80
  const aWords = a.split(/\s+/).filter(w => w.length > 2)
  const bWords = b.split(/\s+/).filter(w => w.length > 2)
  const overlap = aWords.filter(w => bWords.includes(w)).length
  return overlap * 40
}

export default function PantryDeductionPrompt({ userId, ingredients, loggedServings, recipeServings, onDone }: Props) {
  const supabase = createClient()
  const [step, setStep] = useState<'prompt' | 'loading' | 'review' | 'empty' | 'saving' | 'done'>('prompt')
  const [matches, setMatches] = useState<Match[]>([])
  const [finishedItems, setFinishedItems] = useState<string[]>([])
  const [staleItems, setStaleItems] = useState<StaleItem[]>([])

  async function loadMatches() {
    setStep('loading')
    const { data } = await supabase.from('pantry_items').select('*').eq('user_id', userId)
    const pantry = (data ?? []) as PantryItem[]
    const ratio = recipeServings > 0 ? loggedServings / recipeServings : 1

    const found: Match[] = []
    for (const raw of ingredients) {
      const ing = parseIngredient(raw)
      let best: PantryItem | null = null
      let bestScore = 0
      for (const item of pantry) {
        const score = matchScore(ing.name, item.name)
        if (score > bestScore && score >= 40) { bestScore = score; best = item }
      }
      if (best) {
        found.push({
          ingredient: ing,
          pantryItem: best,
          subtract: Math.max(0.1, Math.round(ing.quantity * ratio * 10) / 10),
          checked: true,
        })
      }
    }
    setMatches(found)
    setStep(found.length === 0 ? 'empty' : 'review')
  }

  function toggle(i: number) {
    setMatches(prev => prev.map((m, j) => j === i ? { ...m, checked: !m.checked } : m))
  }

  async function confirm() {
    setStep('saving')
    const consumed: string[] = []

    for (const m of matches.filter(m => m.checked)) {
      const newQty = Math.round((m.pantryItem.quantity - m.subtract) * 10) / 10
      if (newQty <= 0) {
        await supabase.from('pantry_items').delete().eq('id', m.pantryItem.id)
        consumed.push(m.pantryItem.name)
      } else {
        await supabase.from('pantry_items').update({ quantity: newQty }).eq('id', m.pantryItem.id)
      }
    }

    // Check for stale items (added > 14 days ago)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const { data: staleData } = await supabase
      .from('pantry_items')
      .select('id, name, added_at')
      .eq('user_id', userId)
      .lt('added_at', twoWeeksAgo.toISOString())
      .limit(5)

    setFinishedItems(consumed)
    setStaleItems((staleData ?? []) as StaleItem[])
    setStep('done')
  }

  if (step === 'prompt') return (
    <div className="mt-3 flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
      <p className="text-sm text-amber-800">Deduct used ingredients from your pantry?</p>
      <div className="flex gap-2 shrink-0">
        <button onClick={loadMatches} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Yes, update</button>
        <button onClick={onDone} className="px-3 py-1.5 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium">Skip</button>
      </div>
    </div>
  )

  if (step === 'loading') return (
    <p className="mt-3 text-xs text-gray-400 italic">Matching ingredients to your pantry…</p>
  )

  if (step === 'empty') return (
    <p className="mt-3 text-xs text-gray-400">No pantry items matched the recipe ingredients. <button onClick={onDone} className="underline">Dismiss</button></p>
  )

  if (step === 'saving') return (
    <p className="mt-3 text-xs text-gray-400 italic">Updating pantry…</p>
  )

  if (step === 'done') return (
    <div className="mt-3 space-y-2">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 flex items-start gap-2">
        <PartyPopper size={15} className="text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Pantry updated!</p>
          {finishedItems.length > 0 && (
            <p className="text-xs text-emerald-600 mt-0.5">
              You used up: {finishedItems.join(', ')}
            </p>
          )}
        </div>
      </div>

      {staleItems.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
          <p className="text-xs font-semibold text-gray-600 mb-1">
            ⏰ These items have been in your pantry for 2+ weeks:
          </p>
          <p className="text-xs text-gray-500">
            {staleItems.map(i => i.name).join(', ')}
          </p>
          <a href="/pantry" className="text-xs text-emerald-600 underline mt-1.5 block">
            Review &amp; clear old items →
          </a>
        </div>
      )}

      <button onClick={onDone} className="text-xs text-gray-400 hover:text-gray-600 underline block">
        Dismiss
      </button>
    </div>
  )

  return (
    <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-700">Deduct from pantry</p>
        <button onClick={onDone} className="text-xs text-gray-400 hover:text-gray-600 underline">Skip</button>
      </div>
      <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
        {matches.map((m, i) => (
          <button key={i} onClick={() => toggle(i)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors">
            {m.checked
              ? <CheckSquare size={15} className="text-emerald-600 shrink-0" />
              : <Square size={15} className="text-gray-300 shrink-0" />}
            <span className="flex-1 text-sm text-gray-800">{m.pantryItem.name}</span>
            <span className="text-xs text-gray-400 shrink-0 italic">{m.ingredient.raw}</span>
            <span className="text-xs text-red-400 shrink-0 flex items-center gap-0.5 ml-2">
              <Minus size={10} />{m.subtract}{m.ingredient.unit !== 'unit' ? m.ingredient.unit : m.pantryItem.unit}
            </span>
          </button>
        ))}
      </div>
      <div className="px-3 py-2.5 border-t border-gray-100 bg-gray-50">
        <button onClick={confirm} disabled={!matches.some(m => m.checked)}
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors">
          Update pantry ({matches.filter(m => m.checked).length} items)
        </button>
      </div>
    </div>
  )
}
